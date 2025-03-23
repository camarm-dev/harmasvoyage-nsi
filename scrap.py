import csv
from bs4 import BeautifulSoup
from unidecode import unidecode

def get_location(city_name: str):
    results = []
    for city in cities:
        if unidecode(city_name) == unidecode(city[1]):
            results.append(city)
    if len(results) > 1:
        print("Choose valid coords")
        for index, city in enumerate(results):
            print(f"[{index}] {city[1]} {city[7]}")
        choice = int(input(">>> "))
        print("\033[2K" * len(results))
        return [results[choice][8], results[choice][9]]
    elif len(results) == 1:
        return [results[0][8], results[0][9]]
    return []

def get_place_data(place: BeautifulSoup, number: int):
    city = place.find(attrs={"class": "City__Name"}).text.strip()
    country = place.find(attrs={"class": "Country__Name"}).text.strip()
    price = place.find(attrs={"class": "_ib0 _18 _igh _ial _iaj"}).text.replace("dès ", "").replace("€", "").strip()
    image = "https://www.kayak.fr" + place.find("img")["data-original"]
    if image == "https://www.kayak.fr":
        image = "https://content.r9cdn.net/res/images/horizon/explore/destination-placeholder.png?v=6f09568c3b085bb065962f42f3ff300b422a576d&cluster=5"
    fly_time = ""
    location = get_location(city)
    images = [image]
    content = ""
    identifier = f"{number:02}"
    return city, country, [city, country, fly_time, ",".join(images), price, content, ",".join(location), identifier]

def get_data():
    print("Opening kayak.html...")
    file = open('kayak.html')
    tree = BeautifulSoup(file.read(), parser='html.parser')
    places = tree.find_all(attrs={"class": "Explore-GridViewItem"})

    all_places = []
    all_places.append(["City", "Country", "FlyTime", "Images", "Price", "Description", "Location", "Identifier"])
    for index, place in enumerate(places):
        city, country, data = get_place_data(place, index + 1)
        print(f"[+] {data[-1]} {city} {country} ({data[-2]})")
        all_places.append(data)

    print(f"Saving {len(all_places)} places to data.csv")
    writer = csv.writer(open("data.csv", "w"))
    writer.writerows(all_places)
    print("Done.")



if __name__ == '__main__':
    cities_csv = open("other/cities.csv")
    cities = list(csv.reader(cities_csv.readlines()))
    get_data()
