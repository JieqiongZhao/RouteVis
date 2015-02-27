import random
import json


print "Enter first geographic coordinate in lat,lng format"
latlng1 = raw_input()
split1 = latlng1.split(",")
lat1 = float(split1[0])
lng1 = float(split1[1])
print "Enter second geographic coordinate in lat,lng format"
latlng2 = raw_input()
split2 = latlng2.split(",")
lat2 = float(split2[0])
lng2 = float(split2[1])
Aindex =[]
Alat = []
Alng = []
Alatlng =[]
if lat1 <= lat2:
    leftlat = lat1
    leftlng = lng1
    rightlat = lat2
    rightlng = lng2
if lat1 > lat2:
    leftlat = lat2
    leftlng = lng2
    rightlat = lat1
    rightlng = lng1

pointNum = 20

for x in range(0,pointNum):
    Aindex.append(x)
    while True:
        latnum = round(random.uniform(lat1,lat2),6)
        latstr = str(latnum).split(".")[1]
        if len(latstr) == 6 :
            break
    Alat = Alat+[latnum]
    while True:
        lngnum = round(random.uniform(lng1,lng2),6)
        lngstr = str(lngnum).split(".")[1]
        if len(lngstr) == 6 :
            break
    Alng = Alng+[lngnum]
    Alatlng = Alatlng+[[x,latnum,lngnum]]


with open('nodes.txt', 'w') as outfile:
  json.dump(Alatlng, outfile)
with open('nodes.json', 'w') as outfile:
    json.dump(Alatlng, outfile)  
##finished generate nodes



listOfCounts =[]
for y in range(0,pointNum):
    listOfCounts = listOfCounts + [[y,1]]

listOfNodes = []
indexOfNodes = []
for y in range(0,10):
    indexOfNodes = indexOfNodes+[[0,0,0]]

usedNodes = []
output = []
count = 0

while len(usedNodes) != pointNum:
    for y in range(0,pointNum):
        if count == 0:
            listOfNodes = listOfNodes + [[y,random.random()*listOfCounts[y][1]]]
        if count != 0:
            listOfNodes[y] = [y,random.random()*listOfCounts[y][1]]

    #right now it generate the list of random number
    #so I need to sort them now by the weight of each node
    for i in range(1,pointNum):
        j = i
        while j > 0 and listOfNodes[j-1][1] > listOfNodes[j][1]:
            temp = listOfNodes[j-1]
            listOfNodes[j-1] = listOfNodes[j]
            listOfNodes[j] = temp
            j = j - 1
    
    #right now the listOfNodes are sorted
    #so I need to pick a random number ranged from 5 to 10 to pick that many in the listOfNodes
    #also append the distance in that list
    numOfNodes = random.randint(5,10)

    #determine the direction
    numOfDirect = random.randint(1,10)%2;
    print numOfDirect
    for y in range(0,numOfNodes):
        if numOfDirect == 0:
            distance = (Alat[listOfNodes[y][0]] - leftlat)*(Alat[listOfNodes[y][0]] - leftlat)+(Alng[listOfNodes[y][0]] - leftlng)*(Alng[listOfNodes[y][0]] - leftlng)
        if numOfDirect == 1:
            distance = (Alat[listOfNodes[y][0]] - rightlat)*(Alat[listOfNodes[y][0]] - rightlat)+(Alng[listOfNodes[y][0]] - rightlng)*(Alng[listOfNodes[y][0]] - rightlng)
        indexOfNodes[y] =listOfNodes[y]+[distance]


    
    #right now we have the number been picked
    #so I need to sort them by distance^2 with the leftmost point
    for i in range(1,numOfNodes):
        j = i
        while j > 0 and indexOfNodes[j-1][2] > indexOfNodes[j][2]:
            temp = indexOfNodes[j-1]
            indexOfNodes[j-1] = indexOfNodes[j]
            indexOfNodes[j] = temp
            j = j - 1
    #right now we have a sorted by distance list
    #so we put their index in the output list
    for y in range(0,numOfNodes - 1):
        output = output + [[indexOfNodes[y][0],indexOfNodes[y+1][0]]]
    #we put those index in the indexOfNodes in usedNodes 
    for y in range(0, numOfNodes):
        if indexOfNodes[y][0] not in usedNodes:
            usedNodes = usedNodes+[indexOfNodes[y][0]]
        listOfCounts[indexOfNodes[y][0]][1] = listOfCounts[indexOfNodes[y][0]][1]+ 1
        #here you add the count by 10 if it is selected originally
    count = count + 1
    #we need to update the count

for i in range(1,pointNum):
    j = i
    while j > 0 and usedNodes[j-1] > usedNodes[j]:
        temp = usedNodes[j-1]
        usedNodes[j-1] = usedNodes[j]
        usedNodes[j] = temp
        j = j - 1

print usedNodes

##final result print
with open('edges.txt', 'w') as outfile:
  json.dump(output, outfile)
 
