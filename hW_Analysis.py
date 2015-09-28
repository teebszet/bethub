import os
import csv
#from collections import defaultdict

#######################################################################
# Process a single CSV file
#######################################################################
def processFile(myFile):
	with open(myFile, 'r') as csvfile:
		myreader = csv.reader(csvfile, delimiter=',')
		#print(games)
		#print(files)
		for colList in myreader:
			#print (row)
			#col = row.split(',')
			#row = [0, 1, 2, 3, 4]
			#score = '{0},{1}'.format(colList[2],colList[3])
			#print (score)
			HomeGoals = colList[2]
			AwayGoals = colList[3]
			# Increment the home/away/draw counter for this game
			if HomeGoals > AwayGoals:
					myDict['HomeWin']+=1
			elif AwayGoals > HomeGoals:
					myDict['AwayWin']+=1
			else: myDict['Draw']+=1

			#print (myDict)

#######################################################################
# Process all CSV files in the current folder
#######################################################################
myDict1 = {
	'HomeWin' : 0, 
	'AwayWin' : 0, 
	'Draw' : 0  
}

for thisFile in os.listdir('.'):
	if not thisFile.endswith('.csv'): continue
	# Initialise a dictionary with 3 counters for this file
	myDict =  {
		'HomeWin' : 0, 
		'AwayWin' : 0, 
		'Draw' : 0  
	}
	# Process the file and count the results
	processFile(thisFile)
	# Print the results
	print(thisFile)
	for result, count in myDict.items():
		print ('{0}\t{1}'.format(result,count))
		myDict1[result]+=count

print ('GrandTotal')

for result, count in myDict1.items():
	print ('{0}\t{1}'.format(result,count))
