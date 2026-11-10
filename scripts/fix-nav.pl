#!/usr/bin/perl
use strict;
use warnings;

my $file = shift or die "uso: perl scripts/fix-nav.pl <arquivo.tsx>\n";

open my $fh, '<', $file or die "nao abriu $file: $!\n";
local $/;
my $src = <$fh>;
close $fh;

my $orig = $src;

# ---------- 1. import ----------
if ($src =~ m{components/layout/user-menu}) {
  print "SKIP  import ja existia\n";
} else {
  my $import = "import { UserMenu } from '\@/components/layout/user-menu'\n";
  if ($src =~ /^(['"])use client\1;?[ \t]*\n/) {
    substr($src, $+[0], 0) = $import;
  } else {
    $src = $import . $src;
  }
  print "OK    import inserido\n";
}

# ---------- 2. limites de <div> ----------
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

# ---------- 3. localizar bloco do perfil ----------
my @cands;
my %seen;
while ($src =~ /rounded-full/g) {
  my $p = $-[0];
  my ($s1, $e1) = div_bounds($src, $p) or next;
  my $inner = substr($src, $s1, $e1 - $s1);
  next unless $inner =~ /user|name|initial|session|Analyst/i;

  my ($s2, $e2) = div_bounds($src, $s1);
  my ($fs, $fe) = defined $s2 ? ($s2, $e2) : ($s1, $e1);
  next if $seen{"$fs-$fe"}++;

  my $block = substr($src, $fs, $fe - $fs);
  next unless $block =~ /user|name|initial|session|Analyst/i;
  next if length($block) > 2500;
  push @cands, { start => $fs, end => $fe, block => $block };
}

if (!@cands) {
  print "FALHA nenhum bloco de perfil reconhecido\n";
  print "---- cole esta saida ----\n";
  my $cut = 1200;
  my $tail = length($src) > $cut ? substr($src, -$cut) : $src;
  print $tail, "\n";
  exit 2;
}

my $best = (sort { length($b->{block}) <=> length($a->{block}) } @cands)[0];

my $replacement = '        <UserMenu />';
substr($src, $best->{start}, $best->{end} - $best->{start}) = $replacement;

print "OK    bloco do perfil substituido\n";
print "----- trecho removido (inicio) -----\n";
my $preview = substr($best->{block}, 0, 220);
$preview =~ s/\n/ /g;
print "$preview\n";

if ($src eq $orig) {
  print "AVISO nenhuma alteracao aplicada\n";
  exit 3;
}

open my $out, '>', $file or die "nao gravou $file: $!\n";
print $out $src;
close $out;

print "OK    arquivo gravado: $file\n";
