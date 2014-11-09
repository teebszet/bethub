#! /usr/bin/env perl

use strict;
use warnings;
use utf8;
use feature 'say';
use Data::Dumper;

##
## Set up some filenames
##
my $infile = 'cleaned_betexplorer.txt';
my $outfile = "league_table.txt";

say "Reading $infile ...";
say "Save to $outfile";

open (my $fh_in, '<', $infile)
    or die "couldn't open";

open (my $fh_out, '>', $outfile)
    or die "couldn't open";

##
## Read in all scores to a hash
##
my $rh_league = {};
RESULT:
while (readline $fh_in) {
    my ($home_team, $away_team, $home_score, $away_score, $date) =
        m/[^\s]+/g;
    if (!$home_team) {
        next RESULT;
    }
    #say $home_team, $away_team, $home_score, $away_score, $date;
    $rh_league->{$home_team}{goals_for} += $home_score;
    $rh_league->{$home_team}{goals_against} += $away_score;
    $rh_league->{$away_team}{goals_for} += $away_score;
    $rh_league->{$away_team}{goals_against} += $home_score;

    my $home_points;
    my $away_points;
    if ($home_score == $away_score) {
        $home_points = $away_points = 1;
    }
    elsif ($home_score > $away_score) {
        $home_points = 3;
        $away_points = 0;
    }
    elsif ($home_score < $away_score) {
        $home_points = 0;
        $away_points = 3;
    }
    else {
        say "shouldn't get here";
    }
    $rh_league->{$home_team}{points} += $home_points;
    $rh_league->{$away_team}{points} += $away_points;

}

##
## Calculate goal diff and create a list of sorted teams
##
my @positions;
foreach my $team (keys %$rh_league) {
    $rh_league->{$team}{goal_diff} = 
        $rh_league->{$team}{goals_for} - 
        $rh_league->{$team}{goals_against}; 
        
    push @positions, $team;
}
my @sorted_positions = sort sort_on_points @positions; 

##
## Output a sorted League Table here
## 
say $fh_out "Team Goals-For Goals-Against Goal-Diff Points";
# Go through sorted list and print out team data from hash
foreach my $team (@sorted_positions) {
    my $points = $rh_league->{$team}{points};
    my $goals_for = $rh_league->{$team}{goals_for};
    my $goals_against = $rh_league->{$team}{goals_against};
    my $goal_diff = $rh_league->{$team}{goal_diff};
    printf $fh_out "%s %2d %2d %2d %2d\n", 
        ($team, $goals_for, $goals_against, $goal_diff, $points);
}

say "Done";
exit;

##
## functions
##

# sorts by points then goal_diff
sub sort_on_points {
    $rh_league->{$b}{points} <=> $rh_league->{$a}{points} ||
        $rh_league->{$b}{goal_diff} <=> $rh_league->{$a}{goal_diff};
}
