#! /usr/bin/env perl

use strict;
use warnings;
use utf8;
use feature 'say';
use LWP::Simple;
use Data::Dumper;

say "Latest Results: ";
say "Latest Results: ";

my $content = get("http://www.betexplorer.com/soccer/italy/serie-b/results/");
die "Couldn't get it!" unless defined $content;

open (my $fh, '>', 'betexplorer.txt')
    or die "couldn't open";

print $fh $content;

exit;
