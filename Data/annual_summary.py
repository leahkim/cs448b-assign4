import json

yearset_array = [] 
year_index = {}


"""
Each year:
- World's top terror groups by num incidents
- Matrix of country-by-country relationship (separate json)
- Per country 1) number of incidents 2) Top 5 terror groups and 3), {target: , count: }
"""
with open("/Users/ellakim/Documents/classes/448b/cs448b-assign4/Data/kidnap.json", "rb") as infile:
	