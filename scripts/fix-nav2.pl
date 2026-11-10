#!/usr/bin/perl
use strict;
use warnings;

my $file = shift or die "uso: perl scripts/fix-nav2.pl <arquivo.tsx>\n";

open my $fh, '<', $file or die "nao abriu $file: $!\n";
local $/;
my $src = <$fh>;
close $fh;

sub div_balance {
  my ($s) = @_;
  my $o = () = $s =~ /<div\b/g;
  my $c = () = $s =~ /<\/div>/g;
  return $o - $c;
}

my $base = div_balance($src);
print "INFO  arquivo original: desvio $base\n";

sub div_bounds {
  my ($s, $pos) = @_;
  my @stack;
  my $i = 0;
  while (1) {
    my $open  = index($s, '<div', $i);
    my $close = index($s, '</div', $i);
    last if $open < 0 && $close < 0;
    if ($open >= 0 && ($close < 0 || $open < $close)) {
      push @stack, $open;
      $i = $open + 4;
    } else {
      my $start = pop @stack;
      my $gt = index($s, '>', $close);
      last if $gt < 0;
      my $end = $gt + 1;
      if (defined $start && $start <= $pos && $end >= $pos) {
        return ($start, $end);
      }
      $i = $end;
    }
  }
  return;
}

my @cands;
my %seen;
while ($src =~ /rounded-full/g) {
  my $p = $-[0];
  my ($s1, $e1) = div_bounds($src, $p) or next;
  my $inner = substr($src, $s1, $e1 - $s1);
  next unless $inner =~ /user|name|initial|session|Analyst/i;

  my ($s2, $e2) = div_bounds($src, $s1);
  my @spans = ([$s1, $e1]);
  push @spans, [$s2, $e2] if defined $s2;

  for my $sp (@spans) {
    my ($fs, $fe) = @$sp;
    next if $seen{"$fs-$fe"}++;
    my $block = substr($src, $fs, $fe - $fs);
    next if $block =~ /UserMenu/;
    next unless $block =~ /user|name|initial|session|Analyst/i;
    next if length($block) > 3000;

    my $test = $src;
    substr($test, $fs, $fe - $fs) = '';
    my $after = div_balance($test);

    if ($after != $base) {
      print "SKIP  candidato $fs-$fe rejeitado (desvio $after != $base)\n";
      next;
    }

    push @cands, { start => $fs, end => $fe, block => $block };
  }
}

if (!@cands) {
  print "NADA  nenhum bloco removivel com seguranca\n";
  print "      o perfil antigo pode ter outra estrutura. Nada foi alterado.\n";
  exit 2;
}

my $best = (sort { length($b->{block}) <=> length($a->{block}) } @cands)[0];

my $preview = substr($best->{block}, 0, 200);
$preview =~ s/\n/ /g;
print "ALVO  $best->{start} ate $best->{end} (" . length($best->{block}) . " bytes)\n";
print "      $preview\n";

substr($src, $best->{start}, $best->{end} - $best->{start}) = '';

open my $out, '>', $file or die "nao gravou $file: $!\n";
print $out $src;
close $out;

print "OK    bloco removido, arquivo gravado\n";
print "INFO  desvio final: " . div_balance($src) . "\n";
