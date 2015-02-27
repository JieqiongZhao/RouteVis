#required document in the current folder: lists.json, outputX.txt

from osgeo import ogr
import json
import pprint
import collections
import copy
import sys
outFile = open(sys.argv[1],"w")

pp = pprint.PrettyPrinter(indent=4)


class hullNum():
    def __init__(self, route, num):
        self.route = route  # .route is the route number
        self.num = num  # .num is the index of this hull in the route


def routeNum(value, listOfLength):
    lowerbound = 0
    for i in range(0, len(listOfLength)):
        lowerbound = lowerbound + listOfLength[i]
        upperbound = lowerbound + listOfLength[i + 1]
        if lowerbound <= value and value < upperbound:
            return hullNum(i, value - lowerbound)


def convex_hull(points):
    """Computes the convex hull of a set of 2D points.
 
    Input: an iterable sequence of (x, y) pairs representing the points.
    Output: a list of vertices of the convex hull in counter-clockwise order,
      starting from the vertex with the lexicographically smallest coordinates.
    Implements Andrew's monotone chain algorithm. O(n log n) complexity.
    """
 
    # Sort the points lexicographically (tuples are compared lexicographically).
    # Remove duplicates to detect the case we have just one unique point.
    points = sorted(set(points))
 
    # Boring case: no points or a single point, possibly repeated multiple times.
    if len(points) <= 1:
        return points
 
    # 2D cross product of OA and OB vectors, i.e. z-component of their 3D cross product.
    # Returns a positive value, if OAB makes a counter-clockwise turn,
    # negative for clockwise turn, and zero if the points are collinear.
    def cross(o, a, b):
        return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
 
    # Build lower hull 
    lower = []
    for p in points:
        while len(lower) >= 2 and cross(lower[-2], lower[-1], p) <= 0:
            lower.pop()
        lower.append(p)
 
    # Build upper hull
    upper = []
    for p in reversed(points):
        while len(upper) >= 2 and cross(upper[-2], upper[-1], p) <= 0:
            upper.pop()
        upper.append(p)
 
    # Concatenation of the lower and upper hulls gives the convex hull.
    # Last point of each list is omitted because it is repeated at the beginning of the other list. 
    return lower[:-1] + upper[:-1]


def point_in_poly(x, y, poly):
    #http://geospatialpython.com/2011/01/point-in-polygon.html
    n = len(poly)
    inside = False
    p1x,p1y,p1z = poly[0]
    for i in range(n+1):
        p2x,p2y,p2z = poly[i % n]
        if y > min(p1y,p2y):
            if y <= max(p1y,p2y):
                if x <= max(p1x,p2x):
                    if p1y != p2y:
                        xints = (y-p1y)*(p2x-p1x)/(p2y-p1y)+p1x
                    if p1x == p2x or x <= xints:
                        inside = not inside
        p1x,p1y = p2x,p2y
    return inside


def line_intersection(X1,Y1,X2,Y2,X3,Y3,X4,Y4):
    #special cases
    if X1 == X2 and X3 == X4:
        if X1 != X3:
            return False
        else:
            if(max(Y1,Y2) > min(Y3,Y4)) or (max(Y3,Y4) > min(Y1,Y2)):
                return True
            else:
                return False

    if X1 == X2:
        A2 = (Y3-Y4)/(X3-X4)
        b2 = Y3-A2*X3
        tempy = A2*X1 + b2
        if tempy > min(Y3,Y4) and tempy < max(Y3,Y4):
            return True
        elif tempy == min(Y3,Y4) or tempy == max(Y3,Y4):
            return True
        else:
            return False

    if X3 == X4:
        A1 = (Y1-Y2)/(X1-X2)
        b1 = Y1-A1*X1
        tempy = A1*X3 + b1
        if tempy > min(Y1,Y2) and tempy < max(Y1,Y2):
            return True
        elif tempy == min(Y1,Y2) or tempy == max(Y1,Y2):
            return True
        else:
            return False

    #normal cases
    Segment1 = {(X1, Y1), (X2, Y2)}
    Segment2 = {(X3, Y3), (X4, Y4)}
    I1 = [min(X1,X2), max(X1,X2)]
    I2 = [min(X3,X4), max(X3,X4)]
    Ia = [max( min(X1,X2), min(X3,X4) ), min( max(X1,X2), max(X3,X4) )]
    if max(X1,X2) < min(X3,X4):
        return False;
    A1 = (Y1-Y2)/(X1-X2) # what happen if X1 = X2
    b1 = Y1-A1*X1
    A2 = (Y3-Y4)/(X3-X4) # what happen if X3 = X4
    b2 = Y3-A2*X3
    if (A1 == A2):
        return false
    Ya = A1 * Xa + b1
    Ya = A2 * Xa + b2
    #A1 * Xa + b1 = A2 * Xa + b2
    Xa = (b2 - b1) / (A1 - A2)
    if ( (Xa < max( min(X1,X2), min(X3,X4) )) or (Xa > min( max(X1,X2), max(X3,X4) )) ):
        return False
    else:
        return True

#start of the main
#if __name__ == "__main__" :

listOfCoordinates = []
listOfHull = []
coord = []
listOfAllHull = []
listOfPoly =[]
listOfPathIndices = []
listOfLength = [0]
listOfOverlap = []

with open('lists.json') as json_data:
    routes = json.load(json_data)
    json_data.close

for i in range(0,3):#len(routes)):
    #open files to get the data
        name = 'output'+str(i)+'.txt'
        with open(name) as json_data:
                data = json.load(json_data)
                coordinates = data["resourceSets"][0]["resources"][0]["routePath"]["line"]["coordinates"]
                pathIndices = data["resourceSets"][0]["resources"][0]["routePath"]["generalizations"][0]["pathIndices"]
                json_data.close
        listOfPathIndices.append(copy.deepcopy(pathIndices))

        #store the coordinates use () instead of []
        for j in range(0,len(coordinates)):
            temp = (coordinates[j][0],coordinates[j][1])
            coord.append(temp)
        listOfCoordinates.append(copy.deepcopy(coord))

        #create convex hull for two series point
        for j in range(0,len(pathIndices) - 1):
            points = copy.deepcopy(coord[pathIndices[j]:pathIndices[j+1]])
            convex = convex_hull(points)
            #pp.pprint(convex)
            listOfHull.append(convex)
            #store all the convex hull in one list
            listOfPoly.append(copy.deepcopy(convex))

        #store the listOfHull as a vertical structure
        listOfAllHull.append(copy.deepcopy(listOfHull))

        listOfLength.append(len(listOfAllHull[i]))
        del listOfHull[:]
        del coord[:]
        del pathIndices[:]

for i in range(0,len(listOfPoly) - 1):
    ring1 = ogr.Geometry(ogr.wkbLinearRing)
    for j in range(0, len(listOfPoly[i])):
        x = listOfPoly[i][j][0]
        y = listOfPoly[i][j][1]
        ring1.AddPoint(x,y)
    ring1.AddPoint(listOfPoly[i][0][0],listOfPoly[i][0][1])
    poly1 = ogr.Geometry(ogr.wkbPolygon)
    poly1.AddGeometry(ring1)

    #print poly1.ExportToWkt()

    for k in range(i + 1,len(listOfPoly)):
        ring2 = ogr.Geometry(ogr.wkbLinearRing)
        for j in range(0, len(listOfPoly[k])):
            x = listOfPoly[k][j][0]
            y = listOfPoly[k][j][1]
            ring2.AddPoint(x,y)
        ring2.AddPoint(listOfPoly[k][0][0], listOfPoly[k][0][1])
        poly2 = ogr.Geometry(ogr.wkbPolygon)
        poly2.AddGeometry(ring2)
        
        intersection = poly1.Intersection(poly2)
        if intersection is None or intersection.IsEmpty():
            a = 0  # no meaning, just for passing this if statement
                #print intersection
        #elif intersection.IsEmpty():
        else:
            if len(json.loads(intersection.ExportToJson())["coordinates"]) == 1:
                listOfOverlap.append([routeNum(i, listOfLength), routeNum(k, listOfLength), json.loads(intersection.ExportToJson())["coordinates"][0]])
                # print "route" + repr(routeNum(i, listOfLength).route) + " convex hull" + repr(routeNum(i, listOfLength).num) + "," + "route" + repr(routeNum(k, listOfLength).route) + " convex hull" + repr(routeNum(k, listOfLength).num)
                # print json.loads(intersection.ExportToJson())["coordinates"]#[0]
                # if routeNum(i, listOfLength).route == 0 and routeNum(i, listOfLength).num == 32 and routeNum(k, listOfLength).num == 26 and routeNum(k, listOfLength).route == 1 :
                #     print poly1.ExportToWkt()
                #     print poly2.ExportToWkt()
                #     print len(json.loads(intersection.ExportToJson())["coordinates"])

ListOfTotalDot1 = []
ListOfTotalDot2 = []


for i in range(0, len(listOfOverlap)):
    thePoly = listOfOverlap[i][2] # the intersection Polygon

    route1 = listOfOverlap[i][0].route
    route2 = listOfOverlap[i][1].route
    """as requested, only check between two different route"""
    listOfDot1 = []
    listOfDot2 = []
    if route1 != route2:
        num1 = listOfOverlap[i][0].num
        start = listOfPathIndices[route1][num1]  # start index of the convex hull
        end = listOfPathIndices[route1][num1 + 1]
        print start, end
        for j in range(start, end + 1):
            x = listOfCoordinates[route1][j][0]
            y = listOfCoordinates[route1][j][1]
            
            if point_in_poly(x, y, thePoly):
                listOfDot1.append([route1,j,x,y]) #route num, index, x, y
                #print(route1,j,x,y)
        
        num2 = listOfOverlap[i][1].num
        start = listOfPathIndices[route2][num2]  # start index of the convex hull
        end = listOfPathIndices[route2][num2 + 1]
        print start, end
        for j in range(start, end + 1):
            x = listOfCoordinates[route2][j][0]
            y = listOfCoordinates[route2][j][1]
            #print i
            #print j, point_in_poly(x, y, thePoly)
            
            if point_in_poly(x, y, thePoly):
                listOfDot2.append([route2,j,x,y]) #route num, index, x, y
                #print(route2,j,x,y)
        for l in range(0,len(listOfDot1) - 1):
            for k in range(0,len(listOfDot2) - 1):
                if line_intersection(listOfDot1[l][2],listOfDot1[l][3],listOfDot1[l][2],listOfDot1[l][3],listOfDot2[k][2],listOfDot2[k][3],listOfDot2[k][2],listOfDot2[k][3]):
                    print(str(route1)+","+str(listOfDot1[l][1])+","+str(route2)+","+str(listOfDot1[k][1]))
                    outFile.write(str(route1)+","+str(listOfDot1[l][1])+","+str(route2)+","+str(listOfDot1[k][1])+"\n")
                #print(line_intersection(listOfDot1[l][2],listOfDot1[l][3],listOfDot1[l][2],listOfDot1[l][3],listOfDot2[k][2],listOfDot2[k][3],listOfDot2[k][2],listOfDot2[k][3]))


        #del listOfDot2[:]
        #del listOfDot1[:]

outFile.close()

