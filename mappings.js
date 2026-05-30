const funCheapsfCategoryMap = {
    "Community": "#choice_18_3_1",
    "Discount Tix / Promo Codes": "#choice_18_3_2",
    "Downtown San Francisco": "#choice_18_3_3",
    "Early Bird / Presale": "#choice_18_3_4",
    "Nature": "#choice_18_3_5",
    "Outdoors": "#choice_18_3_6",
    "Pets": "#choice_18_3_7",
    "Political Activism": "#choice_18_3_8",
    "Protests / Causes": "#choice_18_3_9",
    "3 Day Weekend": "#choice_18_3_11",
    "420": "#choice_18_3_12",
    "4th of July": "#choice_18_3_13",
    "Christmas": "#choice_18_3_14",
    "Cinco de Mayo": "#choice_18_3_15",
    "Dia de los Muertos": "#choice_18_3_16",
    "Earth Day": "#choice_18_3_17",
    "Easter": "#choice_18_3_18",
    "Father's Day": "#choice_18_3_19",
    "Halloween": "#choice_18_3_21",
    "Hanukkah": "#choice_18_3_22",
    "Juneteenth": "#choice_18_3_23",
    "Labor Day Weekend": "#choice_18_3_24",
    "Lunar New Year": "#choice_18_3_25",
    "Mardi Gras / Fat Tuesday": "#choice_18_3_26",
    "Memorial Day Weekend": "#choice_18_3_27",
    "MLK Day": "#choice_18_3_28",
    "Mother's Day": "#choice_18_3_29",
    "New Year's Day": "#choice_18_3_31",
    "New Year's Eve": "#choice_18_3_32",
    "Oktoberfest": "#choice_18_3_33",
    "Pride": "#choice_18_3_34",
    "St. Patrick's Day": "#choice_18_3_35",
    "Thanksgiving": "#choice_18_3_36",
    "Tree + Holiday Lightings": "#choice_18_3_37",
    "Valentine's Day": "#choice_18_3_38",
    "Veterans Day": "#choice_18_3_39",
    "Adults Only": "#choice_18_3_41",
    "Art & Museums": "#choice_18_3_42",
    "Charity & Volunteering": "#choice_18_3_43",
    "Club / DJ": "#choice_18_3_44",
    "Comedy": "#choice_18_3_45",
    "Eating & Drinking": "#choice_18_3_46",
    "Fairs & Festivals": "#choice_18_3_47",
    "Free Food": "#choice_18_3_48",
    "Fun & Games": "#choice_18_3_49",
    "Geek Event": "#choice_18_3_51",
    "Kids & Families": "#choice_18_3_52",
    "Lectures & Workshops": "#choice_18_3_53",
    "LGBTQ+": "#choice_18_3_54",
    "Literature": "#choice_18_3_55",
    "Live Music": "#choice_18_3_56",
    "Movies": "#choice_18_3_57",
    "Other": "#choice_18_3_58",
    "Shopping & Fashion": "#choice_18_3_59",
    "Sports & Wellness": "#choice_18_3_61",
    "Theater & Performance": "#choice_18_3_62",
    "Walks & Tours": "#choice_18_3_63",
    "Block Party": "#choice_18_3_64",
    "Haunted House": "#choice_18_3_65",
    "Holiday Shopping": "#choice_18_3_66",
    "Rainy Day Fun": "#choice_18_3_67"
};

const funcheapMap = {
    title: "#input_18_1",
    email: "#input_18_43",
    location_name: "#input_18_8",
    description: "#input_18_2",
    website: "#input_18_30",
    name: "#input_18_44",
    organization: "#input_18_42",
    phone: "#input_18_69"
}

const visitOaklandMap = {
    name: "#postname",
    email: "#postemail",
    title: "#title",
    location_name: "#location",
    description: "#description",
    start_datetime: "#startdate",
    phone: "#postphone",
    organization: "#contact",
    address: "#addr1",
    price: "#admission",
    website: "#linkurl"
}

const indyBayMap = {
    name: '#displayed_author_name',
    email: '#email',
    title: '#title1',
    phone: '#phone',
    description: '#text',
    location: '#summary'
}

const sfstationMap = {
    title: "[name='name']",
    description: '#description',
    location: "[name='location']"
}

const SELECTOR_MAPPINGS = {
    sfstation: sfstationMap,
    indybay: indyBayMap,
    visitoakland: visitOaklandMap,
    funcheapsf: funcheapMap,
    funcheapsfCategories: funCheapsfCategoryMap
}
