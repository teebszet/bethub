from urllib.request import urlopen
from bs4 import BeautifulSoup
import re

#baseyear = 1997

def processSeason(country, league, currentyear):

	year1 = currentyear		### Gets the current year within the range of seasons
	year2 = year1 + 1 		### and adds one to it, to get the following year

	with open(country + '_' + league + '_' + str(year1) + '-' + str(year2) + '.csv', 'w') as textfile:		### Opens a text file to write to and 
	#url = 'http://www.betexplorer.com/soccer/england/premier-league-'								### names it according to the variables country, 
	#url += str(year1) + '-' + str(year2) + '/results/'												### league, year1 and year2
		url = 'http://www.betexplorer.com/soccer/{0}/{1}-{2}-{3}/results/'.format(country, league, year1, year2)	# gets the URL to search

		print (url)

		fhtml = urlopen (url)
		html = fhtml.readlines()
	
	#with open('betexplorer.txt','w') as fh2:
		#for line in html :
			#fh2.write(line.decode('utf-8'))
	
		mylist = []

		for line in html :
			mylist.append(line.decode('utf-8'))

		soup = BeautifulSoup(''.join(mylist), 'html.parser')
		
		for tag in soup.findAll('tbody', id = "leagueresults_tbody"):
			for tagrow in tag.findAll('tr'):
				rowlist = []
				for tagcell in tagrow.findAll('td'): #{ "class" : re.compile("first-cell tl" | "result" | "last-cell nobr date")}):
					#print(tagcell)
					rowlist.append(tagcell.string)
				if not rowlist: continue
				for index, value in enumerate(rowlist):
					if not value: rowlist[index] = ""
					if value == '\xa0': rowlist[index] = ""
				teams = rowlist[0].split(' - ')
				scores = rowlist[1].split(':')
				textfile.write('{0},{1},{2},{3},{4}\n'.format(teams[0], teams[1], scores[0], scores[1], rowlist[5]))
				#print(rowlist)

#########################################################
# Program starts here
#########################################################
counter = 0

country = 'england'
league = 'championship'

for season in range(1998,2015):
	counter += 1
	processSeason(country, league, season)
	
	if counter >= 1:
		break
