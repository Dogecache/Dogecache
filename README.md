[Dogecache](http://www.dogecache.com)
==================================
*Much scavenge. Such hunt. Wow.*

An experimental scavenger hunt based around the digital cryptocurrency dogecoin.

Dogecoin donation address: DJgqgx1HcAu7Fk7aZNLRaSjFyzQQ1o2tXj

Dogecache is an innovative app inspired by the principles of geocaching: an outdoor recreational activity where participants use GPS and other navigational techniques to find containers containing small prizes left by other adventurers. There is only one caveat: you must leave something in order to take something. Dogecache puts an exciting spin on this recreational activity by embracing dogecoin. Rather than hunt for physical caches, the user hunts for virtual dogecaches that other explorers have left behind. The app is entirely location dependent, as you find dogecoins near you by dropping some in your current location. That is, the more dogecoins you drop, the larger your search radius is and the more likely you are to find other deposits. The tradeoff lies in the fact that you can only pick up other users’ dogecoins, and dogecoins you drop can only be picked up by other people. This helps encourage people to share their wealth.


##How it works
The app takes the user's current GPS location and displays it on a map. Searching works by dropping dogecoin at your current location that other shibes may pick up. The more doge you drop, the larger your search radius, and you pickup doge that other users have dropped. However, the catch is you can't pick up any doge that you've dropped yourself. By doing this, we are making sure the game remains fun for everyone.

##Compatibility
Dogecache is an HTML 5 mobile-first web app. This means that it will work on any internet enabled device by visiting the app in your preferred browser. Since this is designed to be used on the go, we've optimized it for mobile browsers, though it scales elegantly on desktop devices.

##APIs
The application uses the following APIs:

* Facebook
* DogeAPI
* SendGrid
* Google Charts API

##Development
If you would like to contribute to development, please follow the instructions below to setup the development environment.

###Prerequisites
* Install node.js and MongoDB.
* Run `npm install` to grab all the dependencies.
* Set up the app configuration.

###Configuration
The app configurations can be set in two ways. The presence of a config file overrides the environment file method. Variables are broken up into three categories: `setup` denotes variables that are used for api configurations or other internal system functions. `settings` denotes variables that are flexible and can be used to customize the app. `maintenance` denotes variables that are used during maintenance mode.

1. Config file - Duplicate `config.template.json` in the root directory and name it `config.json`. Fill out all fields.
2. Environment variables - Open up `config.template.json`. Use this file as a reference to set environment variables of the same name. Under this method, config variable categories are ignored. Input environment variables as they appear, without their parent prefix.

##About
Dogecache was originally created during the 24-hour [hackBCA hackathon](http://hackbca2014.challengepost.com/) event by four high school students. The main purpose of the app was to create an experimental digital scavenger hunt based around the digital cryptocurrency Dogecoin. The resulting product was judged as the Most Polished app of the competition by a group of expert judges, including Reddit co-founder Alex Ohanian and Vine co-founder Colin Kroll. In addition, the app was awarded a special award by Intel Corporation for quality mobile design.

##Awards
* [2014 hackBCA Most Polished App](http://hackbca.com/prizes.html)
* [2014 hackBCA Intel Corporation Award for Quality Mobile Design](http://hackbca.com/prizes.html)
* [2014 NYC Techday Exhibitor](https://nytechday.com/startups/dogecache)

##Press
* [Reddit outreach campaign](http://www.reddit.com/r/dogecoin/comments/2282ln/hi_shibes_we_are_high_schoolers_who_have_been/)
* [Blog post by Jesse Podell, the COO of TechDay](http://www.jessepodell.com/hackbca/)
* ["DogeCache: Geocaching meets Dogecoin in an App Created by Teens" - Spelunk.in](http://spelunk.in/2014/04/24/dogecache-geocaching-meets-dogecoin-in-an-app-created-by-teens/)
* ["Dogecache Is Geocaching for Dogecoins" - Motherboard @ Vice](http://motherboard.vice.com/read/dogecache-is-geocaching-for-dogecoins)

##Contact
The authors may be reached at [contact@dogecache.com](mailto:contact@dogecache.com).