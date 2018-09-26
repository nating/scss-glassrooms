# scss-glassrooms
📖 A Flask application for booking Glass Rooms in Trinity College Dublin.

## Overview

View the timetable for Glass Rooms in a nicer interface than can be found at https://www.scss.tcd.ie/cgi-bin/webcal/sgmr/sgmr1.pl.

## Usage

Clone the repository:

```sh
git clone https://github.com/nating/scss-glassrooms
cd scss-glassrooms
```

Add your SCSS credentials to 'config.py' (it won't work for just anybody x):

```py
USERNAME = 'my_username'
PASSWORD = 'my_password'
```

Install Flask if you don't have it:

```sh
pip install flask
```

Start the engine:

```sh
python app.py
```
