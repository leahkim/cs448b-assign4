import pandas
import xlrd
import json

with open("/Users/ellakim/Documents/classes/448b/cs448b-assign4/Data/95_14_ME_data.json", 'rb') as injson:
	list1 = []
	list2 = []
	list3 = []
	list4 = []
	data = json.load(injson)
	for element in data:
		if element['year'] <= 1999:
			list1.append(element)
		elif element['year'] <= 2004:
			list2.append(element)
		elif element['year'] <= 2009:
			list3.append(element)
		else:
			list4.append(element)

	with open("/Users/ellakim/Documents/classes/448b/cs448b-assign4/Data/95_99_data.json", 'wb') as outjson:
		json.dump(list1, outjson)

	with open("/Users/ellakim/Documents/classes/448b/cs448b-assign4/Data/00_04_data.json", 'wb') as outjson:
		json.dump(list2, outjson)

	with open("/Users/ellakim/Documents/classes/448b/cs448b-assign4/Data/05_09_data.json", 'wb') as outjson:
		json.dump(list3, outjson)

	with open("/Users/ellakim/Documents/classes/448b/cs448b-assign4/Data/10_14_data.json", 'wb') as outjson:
		json.dump(list4, outjson)


