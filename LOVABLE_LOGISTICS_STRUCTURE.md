# Lovable LOGISTICS Module Structure

Based on analysis of https://orbi-city.lovable.app/logistics

## Page Header
- Title: "თიხები და დასუფთავება" (Rooms and Cleaning)
- Subtitle: "სტუდიოების ინვენტარის მართვა და ანალიტიკა" (Studio Inventory Management and Analytics)

## 5 Tabs
1. **დეშბორდი** (Dashboard) - Currently active
2. **ინვენტარი** (Inventory)
3. **დასუფთავება** (Cleaning)
4. **ტექნიკური** (Technical)
5. **აქტივობა** (Activity)

## Dashboard Tab Content

### Top KPI Cards (3 cards)
1. **სულ ოთახები** (Total Rooms): 56
2. **რეგულარული ოთახები** (Regular Rooms): 32
3. **ოთახები პრობლემებით** (Rooms with Problems): 24

### Middle Section (2 cards side-by-side)

#### Left Card: დასუფთავება (Cleaning)
- სულ დავალებები (Total Tasks): 28
- შესრულებული (Completed): 27 (green)
- მიმდინარე (In Progress): 1 (yellow)

#### Right Card: ტექნიკური (Technical)
- სულ დავალებები (Total Tasks): 14
- შესრულებული (Completed): 14 (green)
- მიმდინარე (In Progress): 0 (yellow)
- სულ ხარჯი (Total Cost): 762.65 ₾

### Main Content Section

#### დანაკლისი ნივთები კატეგორიების მიხედვით (Missing Items by Category)

**3 Main Categories:**

1. **ავეჯი და ტექსტილი** (Furniture and Textiles)
   - სკამი (Chair): ნაკლი 3
   - აივნის სკამი (Balcony Chair): ნაკლი 12
   - აივნის მაგიდა (Balcony Table): ნაკლი 4
   - საწოლის დეკორატიული გადასაფარებელი (Decorative Bedspread): ნაკლი 2
   - საბნის პირი (Towel): ნაკლი 1
   - ბალიში (Pillow): ნაკლი 5
   - ბალიშის ჩიხოლი (Pillowcase): ნაკლი 9
   - მატრასის გადასაფარებელი (Mattress Cover): ნაკლი 3
   - ზეწარი (Blanket): ნაკლი 5
   - საბანი (Sheet): ნაკლი 8

2. **ტექნიკა** (Appliances)
   - მინიბარი (Minibar): ნაკლი 3
   - მაცივარი (Refrigerator): ნაკლი 1
   - სარეცხის მანქანა (Washing Machine): ნაკლი 1
   - მიკროტალღური (Microwave): ნაკლი 2
   - ელექტრო ჩაიდანი (Electric Kettle): ნაკლი 2

3. **წვრილმანი ინვენტარი** (Small Inventory)
   - ღვინის ბოკალი (Wine Glass): ნაკლი 10
   - ყავის/ჩაის ჭიქა (Coffee/Tea Cup): ნაკლი 5
   - წვენის ჭიქა (Juice Glass): ნაკლი 10
   - არყის ჭიქა (Water Glass): ნაკლი 10
   - ღვინის გასახსნელი (Wine Opener): ნაკლი 7
   - ინდუქციური ქვაბი (Induction Pot): ნაკლი 1
   - სუფრის კოვზი (Table Spoon): ნაკლი 3
   - ჩაის კოვზი (Tea Spoon): ნაკლი 16
   - ქვაბისთვის ჩამჩა (Pot Ladle): ნაკლი 2
   - საჭრელი დანა (Cutting Knife): ნაკლი 6
   - დიდი თეფში (Large Plate): ნაკლი 9
   - საშუალო თეფში (Medium Plate): ნაკლი 2
   - საჭრელი დაფა (Cutting Board): ნაკლი 4
   - საფერფლე (Grater): ნაკლი 5
   - სარეცხის საშრობი (Drying Rack): ნაკლი 1
   - აქანდაზი/ცოცხი (Broom/Mop): ნაკლი 1
   - პოლის ჯოხი (Floor Stick): ნაკლი 3

4. **აბაზანის აქსესუარები** (Bathroom Accessories)
   - ხის კალათა (Wooden Basket): ნაკლი 6

#### დანაკლისი ნივთები ოთახების მიხედვით (Missing Items by Room)

List of rooms with missing items count and expandable details:
- A 1033: 8 items (shows first 3, "+5 მეტი")
- A 1258: 13 items (shows first 3, "+10 მეტი")
- A 1301: 1 item
- A 1806: 14 items (shows first 3, "+11 მეტი")
- A 1833: 2 items
- A 2035: 12 items (shows first 3, "+9 მეტი")
- ... and more rooms (C, D1 series)

Each room shows:
- Room number
- Total missing items count (red badge)
- List of missing items with negative quantities
- "+X მეტი" button to expand if more than 3 items

## UI Design Features
- Clean white background
- Colored tabs (green, blue, orange, purple, teal)
- KPI cards with icons
- Red badges for missing item counts
- Expandable room details
- Category-based organization
- Georgian language interface
