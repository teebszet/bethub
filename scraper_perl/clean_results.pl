#! /usr/bin/env perl

use strict;
use warnings;
use utf8;
use feature 'say';

my $infile = 'betexplorer.txt';
my $outfile = "cleaned_$infile";

say "Cleaning $infile ...";
say "Save to $outfile";

open (my $fh_in, '<', $infile)
    or die "couldn't open";

open (my $fh_out, '>', $outfile)
    or die "couldn't open";

my $content;
my $start = 0;
my $end = 0;
while (readline $fh_in) {
    if ($_ =~ m/<table .*league-results/) {
        $start = 1;
    }
    if ($_ =~ m!</table>!) {
        $end = 1;
    }

    if ($start && !$end && $_ !~ m/Round/) {
        $_ =~ s/<[^>]*>/ /g;    # remove metadata
        $_ =~ s/-//g;           # remove '-'
        $_ =~ s/:/ /g;           # remove '-'
        $_ =~ s/&nbsp;//g;      # remove tab
        $_ =~ s/\s+/ /g;        # remove extra spaces
        $_ =~ s/^\s//g;         # remove leading space
        $_ =~ s/Pro Vercelli/Pro-Vercelli/g;
        say $fh_out $_;
    }
}

say "Done";
exit;
