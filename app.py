from flask import Flask, render_template, request, jsonify
import requests
from datetime import datetime, timedelta
from bs4 import BeautifulSoup
import config

app = Flask(__name__)

@app.route('/')
def index():
    room_number = request.args.get('n')
    days_offset = request.args.get('o')

    # If there are no query parameters, then return the template
    if room_number is None and days_offset is None:

        # Create 'date_text' context variable for template
        date_text = datetime.now().strftime("%A, %d %b %G")

        # Create 'hours' context variable for template
        hours = []
        for i in range(0,24):
            h = {
                'hour': '0%s' % i if i < 10 else i,
                'upcoming': True if ( i >= datetime.now().hour and i < datetime.now().hour + 8 ) else False
            }
            hours.append(h)
        return render_template('index.html',date_text=date_text,hours=hours)
    else:
        # Set up request for room / date
        url = "https://www.scss.tcd.ie/cgi-bin/webcal/sgmr/sgmr%s.pl" % room_number
        date = datetime.now() + timedelta(days=int(days_offset))

        # Make a post to SCSS for this room's booking on this date
        data = {
            'Month': date.month,
            'Year': date.year
        }
        response = requests.post(url, data=data, auth=requests.auth.HTTPBasicAuth(config.USERNAME, config.PASSWORD)).content

        # Get the rows of the page that hold booking information
        soup = BeautifulSoup(response, "html.parser")
        table = soup.findAll("table")
        tr = table[1].findAll("tr")
        td = tr[0].findAll("td")[0]
        rows = td.findAll("tr")

        # Enumerate all the rows with booking information
        bookings = [None] * 24
        for index, tr in enumerate(rows):

            # If the row is the day being searched for (e.g. <tr><td bgcolor="#ffffff"><strong><font color="#000000">7 May 2018 (Monday):</font></strong></td></tr>)
            if tr.text.split(' ')[0] == str(date.day):

                # Get the bookings from the next row (e.g. <tr><td bgcolor="#ccccff"><font color="#0000ff">10:00-14:00<br>14:00-16:00 Paddy Irishman [bscis4] <br>16:00-18:00 John Appleseed [bscis4] <br>18:00-20:00 Jane Doe [bscis4] <br>20:00-22:00 John Doe [bscis4] </font></td></tr>)
                booking_strings = [s.strip() for s in str(rows[index+1].findAll("font")[0])[22:][:-8].split('<br/>')]

                # Add all the bookings for that day
                for b in booking_strings:
                    start_hour = datetime.strptime(b[:5],"%H:%M")
                    end_hour = datetime.strptime(b[6:11],"%H:%M")
                    booking = {
                        'time': int(b[:2]),
                        'length': 2 if end_hour - start_hour == timedelta(hours=2) else 1,
                        'name': b[11:].split('[')[0].strip()
                    }
                    bookings[int(b[:2])] = booking

        return jsonify(bookings)

if __name__ == '__main__':
    app.run(debug=False)
