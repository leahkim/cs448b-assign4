import json
from sets import Set

"""
#### PROTO ####
{"year": 1970,
 "data":
        {"incident_count":
            {"total": 16,
             "region": {"North America": 6, "Western Europe": 5, "Eastern Europe & Central Asia":5},
             "type": {"Government": 12, "Civilians & Properties": 4}
             },
        "kidnapped":
            {"total": 200,
             "region": {"North America": 100, "Western Europe": 60, "Eastern Europe & Central Asia":40},
             "type": {"Government": 180, "Civilians & Properties": 20}
            },
        "killed":
            {"total": 20,
             "region": {"North America": 10, "Western Europe": 10, "Eastern Europe & Central Asia":0},
             "type": {"Government": 15, "Civilians & Properties": 5}}
            }
        }
}
"""

result = []

with open("/Users/ellakim/Documents/spring_16/448B/cs448b-assign4/Data/kidnap_by_year.json", "rb") as infile:
    data = json.load(infile)
    for entry in data:
        year = entry['year']
        entry_shell = {"year": year, "data": None}
        data_shell = {"incident_count": None, "kidnapped": None, "killed": None}
        count_shell = {"total": 0, "region": None, "type": None}
        kidnap_shell = {"total": 0, "region": None, "type": None}
        kill_shell = {"total": 0, "region": None, "type": None}

        already_seen_regions = Set()
        already_seen_types = Set()

        region_count_shell = {}
        region_kidnap_shell = {}
        region_kill_shell = {}

        type_count_shell = {}
        type_kidnap_shell = {}
        type_kill_shell = {}

        """
        {"ransom": 0,
        "nwound_victims": 0,
        "nkill_victims": 0,
        "safe_victims": 1,
        "ntotal_kid": 1,
        "targtype": "Government",
        "region": "North America",
        }
        """

        data_array = entry['data']
        for line in data_array:
            region = line["region"]
            target_type = line["targtype"]

            if (line["ransom"] == 0):
                count_shell["total"] += 1
                kidnap_shell["total"] += (0 if line["ntotal_kid"] == "Unknown" else line["ntotal_kid"]) # check of unknown
                kill_shell["total"] += (0 if line["nkill_victims"] == "Unknown" else line["nkill_victims"]) # check of unknown
                if (region not in already_seen_regions):
                    region_count_shell[region] = 1
                    region_kidnap_shell[region] = (0 if line["ntotal_kid"] == "Unknown" else line["ntotal_kid"])
                    region_kill_shell[region] = (0 if line["nkill_victims"] == "Unknown" else line["nkill_victims"])
                    already_seen_regions.add(region)
                else:
                    region_count_shell[region] += 1
                    region_kidnap_shell[region] += (0 if line["ntotal_kid"] == "Unknown" else line["ntotal_kid"])
                    region_kill_shell[region] += (0 if line["nkill_victims"] == "Unknown" else line["nkill_victims"])

                if (target_type not in already_seen_types):
                    type_count_shell[target_type] = 1
                    type_kidnap_shell[target_type] = (0 if line["ntotal_kid"] == "Unknown" else line["ntotal_kid"])
                    type_kill_shell[target_type] = (0 if line["nkill_victims"] == "Unknown" else line["nkill_victims"])
                    already_seen_types.add(target_type)
                else:
                    type_count_shell[target_type] += 1
                    type_kidnap_shell[target_type] += (0 if line["ntotal_kid"] == "Unknown" else line["ntotal_kid"])
                    type_kill_shell[target_type] += (0 if line["nkill_victims"] == "Unknown" else line["nkill_victims"])

        kill_shell["region"] = region_kill_shell
        kill_shell["type"] = type_kill_shell

        kidnap_shell["region"] = region_kidnap_shell
        kidnap_shell["type"] = type_kidnap_shell

        count_shell["region"] = region_count_shell
        count_shell["type"] = type_count_shell

        data_shell["incident_count"] = count_shell
        data_shell["kidnapped"] = kidnap_shell
        data_shell["killed"] = kill_shell

        entry_shell["data"] = data_shell

        result.append(entry_shell)
        print(result)

with open("/Users/ellakim/Documents/spring_16/448B/cs448b-assign4/Data/kidnap_year_summary.json", "wb") as outfile:
    json.dump(result, outfile)





