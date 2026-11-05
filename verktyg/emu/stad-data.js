// Realistiska sysslor för förhandsbilder av Städ (NOW 2026-10-18)
const gas=require('./gas');const R=gas.book.sheets['Städ'].rows;
const d=n=>{const x=new Date('2026-10-18T12:00:00');x.setDate(x.getDate()-n);return x.toISOString().slice(0,10)};
[['k1','Kök','Diska och töm diskmaskinen',1,10,d(0),'Henrik'],['k2','Kök','Torka av bänkar och spis',1,5,d(1)],['h1','Hundar','Diska hundskålarna, nytt vatten',1,3,d(1)],['a1','Alla rum','Plocka undan 5 minuter',1,5,d(0),'Cornelia'],
 ['k3','Kök','Torka av kylskåpet',7,10,d(9)],['k4','Kök','Byt disktrasa och handdukar',3,2,d(4)],['k5','Kök','Rengör mikron',14,5,d(20)],['k6','Kök','Frosta av frysen',90,45,d(85)],
 ['v1','Vardagsrum','Dammsug vardagsrummet',7,10,d(8)],['v2','Vardagsrum','Damma hyllor och tv-bänk',14,10,d(12)],['v3','Vardagsrum','Tvätta soffkuddarnas överdrag',90,20,d(95)],
 ['s1','Sovrum','Byt sängkläder',14,15,d(15)],['s2','Sovrum','Dammsug sovrummet',7,10,d(5)],['s3','Sovrum','Vädra täcken och kuddar',30,10,d(26)],
 ['ha1','Hall','Skaka dörrmattan',7,3,d(10)],['ha2','Hall','Torka av skohyllan',30,10,d(40)],
 ['t1','Toalett','Rengör toalettstolen',7,10,d(7)],['t2','Toalett','Torka handfat och spegel',3,5,d(2)],['t3','Toalett','Skura duschen',14,20,d(18)],
 ['hu2','Hundar','Borsta hundarna',3,10,d(3)],['hu3','Hundar','Tvätta hundbäddarna',30,15,d(33)],
 ['a2','Alla rum','Moppa golven',14,25,d(16)],['a3','Alla rum','Tvätta fönstren',90,60,d(70)]]
.forEach(([id,room,title,freq,min,last,who])=>R.push([id,room,title,freq,min,last,'',last===d(0)?(who||'Henrik'):'',last===d(0)?'':(who||''),'','','','']));
