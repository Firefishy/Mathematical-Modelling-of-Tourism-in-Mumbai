import folium as fl
from data import hotels, places
from pandas import DataFrame as df
# 18.89,19.21,19.05
# 72.77,72.95,72.86

plocs = [(p['lat'], p['lng']) for p in places]
pnames = [p['name'] for p in places]
hlocs = [(h['lat'], h['lng']) for h in hotels]
hnames = [h['name'] for h in hotels]

lats = [l[0] for l in hlocs]
lons = [l[1] for l in hlocs]

latb = (max(lats)+.05, min(lats)-.05)
lonb = (max(lons)+.05, min(lons)-.05)
c = [sum(latb)/2, sum(lonb)/2]
bb = [(latb[1], lonb[1]), (latb[0], lonb[0])]


def map_path(start, path, time):
    mp = fl.Map(location=c, zoom_start=16)
    mp.fit_bounds(bb)
    loc_path = list(map(lambda i: plocs[i], path))
    name_path = list(map(lambda i: pnames[i], path))
    fl.PolyLine(locations=[hlocs[start]]+loc_path).add_to(mp)
    fl.Marker(location=hlocs[start], tooltip='1. '+hnames[start], icon=fl.Icon(
        color='green', icon_color='lightgray')).add_to(mp)
    for i, l, n in zip(range(len(path)), loc_path, name_path):
        fl.Marker(location=l, tooltip=str(i+2)+'. '+n, icon=fl.Icon(
            color='red', icon_color='lightgray')).add_to(mp)

    plist = df(zip(name_path, map(lambda x: f'{int(x//1)} hrs {int((x%1)*60)} mins', time)),
               columns=['Location', 'Time spent'], index=range(1, len(path)+1)).to_html(border=0, classes='tbl')

    legend = f'''<div style="
        width: max-content;
        height: max-content;
        top: 50px;
        left: 50px;
        background: rgba(0,0,0,0.8);
        z-index: 999;
        position: fixed;
        color: #ddd;
        padding: 1em;
        font-size: 16pt;
        ">
        <style> 
        .tbl td,th {{padding: 0 .5em}}
        @media (max-width:600px){{ .tblC {{font-size: .5em}} }}
        </style>
        <div class="tblC">
            <span style="margin-left: .5em"><b>Hotel:</b> {hnames[start]} </span>
            {plist}  
        <hr>
        <a href="https://cutt.ly/DRIPQ"><b>View Code on GitHub</b></a>
        </div></div>'''
    mp.get_root().html.add_child(fl.Element(legend))

    mp.save('./map.html')
