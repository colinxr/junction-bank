import decimal

def convert_usd_to_cad(transactions, exchange_rate):
    """
    Converts the 'amount_usd' to 'amount_cad' for a list of transactions.

    Args:
        transactions (list): A list of dictionaries representing transactions.
        exchange_rate (decimal.Decimal): The USD to CAD exchange rate.

    Returns:
        list: The list of transactions with 'amount_cad' updated.
    """
    updated_transactions = []
    for transaction in transactions:
        # Use Decimal for accurate financial calculations
        amount_usd = decimal.Decimal(transaction['amount_usd'])
        amount_cad = amount_usd * exchange_rate
        # Update the transaction record, formatting to 2 decimal places
        transaction['amount_cad'] = round(amount_cad, 2)
        updated_transactions.append(transaction)
    return updated_transactions

# Today's USD to CAD exchange rate
# Rate as of September 21, 2025
usd_to_cad_rate = decimal.Decimal('1.37805')

# The full JSON representation of your data
transactions_data = [
    {'id': 1911, 'name': 'LEMONADE INSURANCE NEW YORK NY', 'amount_usd': '24.58', 'amount_cad': '0.00'},
    {'id': 1910, 'name': 'SOLIDCORE HOLLYWOOD LOS ANGELES CA', 'amount_usd': '40.00', 'amount_cad': '0.00'},
    {'id': 1909, 'name': 'COPYCAT LA LOS ANGELES CA', 'amount_usd': '2.80', 'amount_cad': '0.00'},
    {'id': 1908, 'name': 'SPOTIFY USA NEW YORK NY', 'amount_usd': '11.99', 'amount_cad': '0.00'},
    {'id': 1907, 'name': 'AMC 0218 BURBANK 16 BURBANK CA', 'amount_usd': '19.95', 'amount_cad': '0.00'},
    {'id': 1906, 'name': 'FANDANGO 8003263264 CA', 'amount_usd': '47.36', 'amount_cad': '0.00'},
    {'id': 1905, 'name': 'AMAZON COM SEATTLE WA', 'amount_usd': '10.42', 'amount_cad': '0.00'},
    {'id': 1904, 'name': 'AMAZON COM SEATTLE WA', 'amount_usd': '10.95', 'amount_cad': '0.00'},
    {'id': 1903, 'name': 'AMAZON COM SEATTLE WA', 'amount_usd': '36.21', 'amount_cad': '0.00'},
    {'id': 1902, 'name': 'AMAZON COM SEATTLE WA', 'amount_usd': '38.40', 'amount_cad': '0.00'},
    {'id': 1901, 'name': '5578 YORK BLVD US LOS ANGELES CA', 'amount_usd': '17.50', 'amount_cad': '0.00'},
    {'id': 1900, 'name': 'EAGLEROCK GREEN DRAGON LOS ANGELES CA', 'amount_usd': '49.04', 'amount_cad': '0.00'},
    {'id': 1899, 'name': 'MASABI LAXFLYAWAY 323 310 5292 CA', 'amount_usd': '12.75', 'amount_cad': '0.00'},
    {'id': 1898, 'name': 'UBER TRIP HELP UBER C 8005928996 CA', 'amount_usd': '31.74', 'amount_cad': '0.00'},
    {'id': 1897, 'name': 'SQ STANDING EGG LOS ANGELES CA', 'amount_usd': '10.03', 'amount_cad': '0.00'},
    {'id': 1896, 'name': 'EVERYBODY LOS ANGELES CA', 'amount_usd': '15.00', 'amount_cad': '0.00'},
    {'id': 1895, 'name': 'LA METRO MOBILE APP LOS ANGELES CA', 'amount_usd': '10.00', 'amount_cad': '0.00'},
    {'id': 1894, 'name': 'WEB VENMO PAYMENT', 'amount_usd': '85.00', 'amount_cad': '0.00'},
    {'id': 1893, 'name': 'PPD IRS USATAXPYMT', 'amount_usd': '100.00', 'amount_cad': '0.00'},
    {'id': 1892, 'name': 'PPD GUSTO ACCTVERIFY', 'amount_usd': '0.01', 'amount_cad': '0.00'},
    {'id': 1891, 'name': 'VET RX DIRECT CORALVILLE IA', 'amount_usd': '66.67', 'amount_cad': '0.00'},
    {'id': 1890, 'name': 'UBER TRIP 8005928996 CA', 'amount_usd': '13.73', 'amount_cad': '0.00'},
    {'id': 1889, 'name': 'GFM GOFUNDME NUNS WITH GOFUNDME COM CA', 'amount_usd': '20.00', 'amount_cad': '0.00'},
    {'id': 1888, 'name': 'SQ SCHOOL LUNCH LOS ANGELES CA', 'amount_usd': '15.36', 'amount_cad': '0.00'},
    {'id': 1887, 'name': 'ALBERTSONS 0387 LOS ANGELES CA', 'amount_usd': '11.91', 'amount_cad': '0.00'},
    {'id': 1886, 'name': 'HULU SANTA MONICA CA', 'amount_usd': '18.99', 'amount_cad': '0.00'},
    {'id': 1885, 'name': 'GOOD HANDS LOS ANGELES CA', 'amount_usd': '144.00', 'amount_cad': '0.00'},
    {'id': 1884, 'name': 'WEB VENMO PAYMENT', 'amount_usd': '28.00', 'amount_cad': '0.00'},
    {'id': 1883, 'name': 'EA ELECTRONIC ARTS HELP EA COM CA', 'amount_usd': '19.99', 'amount_cad': '0.00'},
    {'id': 1882, 'name': 'ALBERTSONS 0387 LOS ANGELES CA', 'amount_usd': '36.48', 'amount_cad': '0.00'},
    {'id': 1881, 'name': 'TST LITTLE DOMS LOS LOS ANGELES CA', 'amount_usd': '84.15', 'amount_cad': '0.00'},
    {'id': 1880, 'name': 'UNIQLO USA LLC UNIQLO LOS ANGELES CA', 'amount_usd': '42.36', 'amount_cad': '0.00'},
    {'id': 1879, 'name': 'UBER TRIP 8005928996 CA', 'amount_usd': '30.95', 'amount_cad': '0.00'},
    {'id': 1878, 'name': 'WEB Property Managem WEB PMTS', 'amount_usd': '2241.33', 'amount_cad': '0.00'},
    {'id': 1877, 'name': 'NON-BMO ATM FEE', 'amount_usd': '3.00', 'amount_cad': '0.00'},
    {'id': 1876, 'name': 'CHARGEPOINT INC CAMPBELL CA', 'amount_usd': '19.95', 'amount_cad': '0.00'},
    {'id': 1875, 'name': 'TST ALAMO DRAFTHOUSE LOS ANGELES CA', 'amount_usd': '16.07', 'amount_cad': '0.00'},
    {'id': 1874, 'name': 'TST GOLD LINE LOS ANGELES CA', 'amount_usd': '20.76', 'amount_cad': '0.00'},
    {'id': 1873, 'name': 'TST GOLD LINE LOS ANGELES CA', 'amount_usd': '20.76', 'amount_cad': '0.00'},
    {'id': 1872, 'name': 'SP COLOURPOP OXNARD CA', 'amount_usd': '38.73', 'amount_cad': '0.00'},
    {'id': 1871, 'name': 'AHF ORG AHF ORG LOS ANGELES CA', 'amount_usd': '50.00', 'amount_cad': '0.00'},
    {'id': 1870, 'name': 'LYFT RIDE TUE 5PM SAN FRANCISC CA', 'amount_usd': '11.99', 'amount_cad': '0.00'},
    {'id': 1869, 'name': 'SUPER KING MKT LOS ANGELES CA', 'amount_usd': '20.54', 'amount_cad': '0.00'},
    {'id': 1868, 'name': 'ALBERTSONS 0387 LOS ANGELES CA', 'amount_usd': '41.98', 'amount_cad': '0.00'},
    {'id': 1867, 'name': 'ALBERTSONS 0387 LOS ANGELES CA', 'amount_usd': '1.78', 'amount_cad': '0.00'},
    {'id': 1866, 'name': 'LASSENS NATURAL LOS ANGELES CA', 'amount_usd': '7.86', 'amount_cad': '0.00'},
    {'id': 1865, 'name': 'AMAZON COM RB5EC2QJ3 SEATTLE WA', 'amount_usd': '51.81', 'amount_cad': '0.00'},
    {'id': 1864, 'name': '7 ELEVEN LOS ANGELES CA', 'amount_usd': '8.98', 'amount_cad': '0.00'},
    {'id': 1863, 'name': 'WEB VENMO PAYMENT', 'amount_usd': '310.07', 'amount_cad': '0.00'},
    {'id': 1862, 'name': 'CCD STRIPE TRANSFER', 'amount_usd': '0.56', 'amount_cad': '0.00'},
    {'id': 1861, 'name': 'UBER TRIP 8005928996 CA', 'amount_usd': '31.75', 'amount_cad': '0.00'},
    {'id': 1860, 'name': 'SQ BRU COFFEEBAR LOS FELIZ CA', 'amount_usd': '4.50', 'amount_cad': '0.00'},
    {'id': 1859, 'name': 'UBER TRIP 8005928996 CA', 'amount_usd': '1.00', 'amount_cad': '0.00'},
    {'id': 1858, 'name': 'LYFT RIDE THU 7PM SAN FRANCISC CA', 'amount_usd': '39.90', 'amount_cad': '0.00'},
    {'id': 1857, 'name': 'LYFT RIDE THU 8PM SAN FRANCISC CA', 'amount_usd': '23.65', 'amount_cad': '0.00'},
    {'id': 1856, 'name': 'ZELLE TO JORGE CASTRO', 'amount_usd': '120.00', 'amount_cad': '0.00'},
    {'id': 1855, 'name': 'LYFT RIDE FRI 10AM SAN FRANCISC CA', 'amount_usd': '10.92', 'amount_cad': '0.00'},
    {'id': 1854, 'name': 'SQ BRU COFFEEBAR LOS FELIZ CA', 'amount_usd': '4.75', 'amount_cad': '0.00'},
    {'id': 1853, 'name': 'WEB VENMO PAYMENT', 'amount_usd': '15.00', 'amount_cad': '0.00'},
    {'id': 1852, 'name': 'WEB VENMO PAYMENT', 'amount_usd': '20.00', 'amount_cad': '0.00'},
    {'id': 1851, 'name': 'WEB VENMO PAYMENT', 'amount_usd': '60.00', 'amount_cad': '0.00'},
    {'id': 1850, 'name': 'WEB T-MOBILE PCS SVC', 'amount_usd': '182.29', 'amount_cad': '0.00'},
    {'id': 1849, 'name': 'DDA DEBIT', 'amount_usd': '770.00', 'amount_cad': '0.00'},
    {'id': 1848, 'name': 'LS OFF THE LEASH MODER GLENDALE CA', 'amount_usd': '22.08', 'amount_cad': '0.00'},
    {'id': 1847, 'name': 'LYFT RIDE FRI 10AM SAN FRANCISC CA', 'amount_usd': '1.00', 'amount_cad': '0.00'},
    {'id': 1846, 'name': 'AMAZON COM OL0312EC3 SEATTLE WA', 'amount_usd': '14.21', 'amount_cad': '0.00'},
    {'id': 1845, 'name': '5578 YORK BLVD US LOS ANGELES CA', 'amount_usd': '42.50', 'amount_cad': '0.00'},
    {'id': 1844, 'name': 'ALBERTSONS 0387 LOS ANGELES CA', 'amount_usd': '9.62', 'amount_cad': '0.00'},
    {'id': 1843, 'name': 'ISLAND PACIFIC SUPER LOS ANGELES CA', 'amount_usd': '53.06', 'amount_cad': '0.00'},
    {'id': 1842, 'name': 'DISNEYPLUS BURBANK CA', 'amount_usd': '12.00', 'amount_cad': '0.00'},
    {'id': 1841, 'name': 'WEB VENMO PAYMENT', 'amount_usd': '12.08', 'amount_cad': '0.00'},
    {'id': 1840, 'name': 'FRANKLIN COMPANY LOS ANGELES CA', 'amount_usd': '78.53', 'amount_cad': '0.00'},
    {'id': 1839, 'name': 'SQ BRU COFFEEBAR LOS FELIZ CA', 'amount_usd': '12.00', 'amount_cad': '0.00'},
    {'id': 1838, 'name': 'SQ MARU LOS FELIZ LOS ANGELES CA', 'amount_usd': '8.00', 'amount_cad': '0.00'},
    {'id': 1837, 'name': 'APPLE COM BILL 866 712 7753 CA', 'amount_usd': '2.99', 'amount_cad': '0.00'},
    {'id': 1836, 'name': 'ZELLE FROM LOREN ESPINOZA', 'amount_usd': '933.45', 'amount_cad': '0.00'},
    {'id': 1835, 'name': 'LASSENS NATURAL LOS ANGELES CA', 'amount_usd': '4.59', 'amount_cad': '0.00'},
    {'id': 1834, 'name': 'AMAZON COM XO99B9MR3 SEATTLE WA', 'amount_usd': '42.18', 'amount_cad': '0.00'},
    {'id': 1833, 'name': 'SQ BRU COFFEEBAR LOS FELIZ CA', 'amount_usd': '5.25', 'amount_cad': '0.00'},
    {'id': 1832, 'name': 'USPS PO 0545400027 LOS ANGELES CA', 'amount_usd': '52.60', 'amount_cad': '0.00'},
    {'id': 1831, 'name': 'NON-BMO ATM FEE', 'amount_usd': '3.00', 'amount_cad': '0.00'},
    {'id': 1830, 'name': 'TST JENI S SPLENDID I LOS ANGELES CA', 'amount_usd': '33.02', 'amount_cad': '0.00'},
    {'id': 1829, 'name': 'FLORAL ART BY MIA INC LOS ANGELES CA', 'amount_usd': '7.25', 'amount_cad': '0.00'},
    {'id': 1828, 'name': 'AMAZON COM 6L6NN1M23 SEATTLE WA', 'amount_usd': '21.94', 'amount_cad': '0.00'},
    {'id': 1827, 'name': 'LA METRO MOBILE APP LOS ANGELES CA', 'amount_usd': '10.00', 'amount_cad': '0.00'},
    {'id': 1826, 'name': 'ISLAND PACIFIC SUPER LOS ANGELES CA', 'amount_usd': '5.78', 'amount_cad': '0.00'},
    {'id': 1825, 'name': 'WILSON HARDING MUNGOLF LOS ANGELES CA', 'amount_usd': '20.00', 'amount_cad': '0.00'},
    {'id': 1824, 'name': 'CHEWY COM 800 672 4399 FL', 'amount_usd': '131.96', 'amount_cad': '0.00'},
    {'id': 1823, 'name': 'ALBERTSONS 038 LOS ANGELES CA', 'amount_usd': '16.45', 'amount_cad': '0.00'},
    {'id': 1822, 'name': 'ALBERTSONS 038 LOS ANGELES CA', 'amount_usd': '11.29', 'amount_cad': '0.00'},
    {'id': 1821, 'name': 'TRADER JOE S 017 LOS ANGELES CA', 'amount_usd': '52.66', 'amount_cad': '0.00'},
    {'id': 1820, 'name': 'UBER TRIP 8005928996 CA', 'amount_usd': '14.99', 'amount_cad': '0.00'},
    {'id': 1819, 'name': 'PHO VT LOS ANGELES CA', 'amount_usd': '79.89', 'amount_cad': '0.00'},
    {'id': 1818, 'name': 'SQ BRU COFFEEBAR LOS FELIZ CA', 'amount_usd': '5.50', 'amount_cad': '0.00'},
    {'id': 1817, 'name': 'ALBERTSONS 038 LOS ANGELES CA', 'amount_usd': '53.86', 'amount_cad': '0.00'},
    {'id': 1816, 'name': 'SQ BRU COFFEEBAR LOS FELIZ CA', 'amount_usd': '4.50', 'amount_cad': '0.00'},
    {'id': 1815, 'name': 'ALBERTSONS 038 LOS ANGELES CA', 'amount_usd': '21.67', 'amount_cad': '0.00'}
]


# Convert the transactions
updated_data = convert_usd_to_cad(transactions_data, usd_to_cad_rate)

# Print the results in a more legible format for manual database entry
print("=" * 80)
print("USD TO CAD CONVERSION RESULTS")
print("=" * 80)
print()

for t in updated_data:
    print(f"ID: {t['id']}")
    print(f"Merchant: {t['name']}")
    print(f"USD Amount: ${t['amount_usd']}")
    print(f"CAD Amount: ${t['amount_cad']}")
    print("-" * 50)