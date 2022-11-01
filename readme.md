
> # ForestBot's API Hub


This api is used as a central hub for any application or human that needs to access information that ForestBot has saved.
All bots essentially connect to this HUB and communicate to the database via restful api endpoints.

> API URL: [https://api.forestbot.org](https://api.forestbot.org) <br>
> Website URL: [https://forestbot.org](https://forestbot.org) 


> ## Endpoints:
> > #### Public Routes:
> > - /playtime/:user/:server
> > - /joindate/:user/:server
> > - /joins/:user/:server
> > - /kd/:user/:server
> > - /lastdeath/:user/:server
> > - /messagecount/:user/:server
> > - /user/:user/:server
> > - /tab/:server
> > - /quote/:user/:server

> > #### Private Routes:
> > - /savechat/:user/:server
> > - /saveplaytime/:user/:server
> > - /savepvekill/:user/:server
> > - /savepvpkill/:user/:server
> > - /updatejoin/:user/:server
> > - /updateleave/:user/:server 
