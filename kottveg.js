/* Kött/Veg: vilka inspirationsrecept som går att laga som en grundrätt där var och en väljer sitt protein,
   och hur stegen delar sig. Ett inspirationsrecept som inte finns här blir aldrig Kött/Veg, eftersom köttet
   är själva rätten (färssås, biffar, köttbullar, gratänger) eller buljongen är gjord på kött.
   dv/dk: förvalt vegetariskt protein (i kötträtter) eller kött (i vegetariska rätter).
   Varje steg: t = gemensamt för båda, k = Henriks del, v = den vegetariska delen.
   g = steget där proteinet lagas. Där står texten för receptets eget protein; väljer någon ett annat
   protein visas tillagningen för det i stället. {kott} och {veg} blir det valda proteinet, t.ex. "kycklingen". */
window.KottVeg={
'insp-citronkyckling':{dv:'halloumi',s:[
 {t:'Riv citronskalet och pressa saften. Blanda hälften av saften med skalet, pressad vitlök, timjan, olja, salt och peppar.',k:'Vänd {kott} i hälften av marinaden.',v:'Vänd {veg} i den andra hälften.'},
 {t:'Koka bulgurn enligt förpackningen.',timer:12},
 {g:1,timer:12,k:'Stek kycklingen på medelvärme tills den är genomstekt.',v:'Skiva halloumin och stek den i en egen panna, 2 minuter per sida.'},
 {t:'Koka eller stek haricots verts de sista minuterna.',timer:4},
 {t:'Rör ner resten av citronsaften i kvargen och servera.'}]},
'insp-sej-tomat':{dv:'kikartor',s:[
 {t:'Sätt ugnen på 200 grader.'},
 {t:'Koka matvetet.',timer:15},
 {t:'Hacka löken och vitlöken och fräs dem i olivolja. Tillsätt tomater, oliver och oregano och låt puttra en stund.'},
 {g:1,k:'Lägg den tinade fisken i en ugnsform, salta och häll över hälften av såsen.',v:'Skölj kikärtorna, lägg dem i en liten form och häll över resten av såsen.'},
 {t:'Baka i mitten av ugnen.',timer:18},
 {t:'Servera med matvete och sallad.'}]},
'insp-ugnslax-dill':{dv:'halloumi',s:[
 {t:'Sätt ugnen på 200 grader.'},
 {t:'Koka potatisen.',timer:20},
 {g:1,timer:15,k:'Lägg laxen i en form, salta och peppra och baka i ugnen.',v:'Skiva halloumin och stek den i en egen panna, 2 minuter per sida.'},
 {t:'Koka broccolin.',timer:5},
 {t:'Rör ihop kvarg, hackad dill, citronsaft, salt och peppar.'}]},
'insp-torsk-arter':{dv:'halloumi',s:[
 {t:'Sätt ugnen på 200 grader.'},
 {t:'Koka potatisen.',timer:20},
 {g:1,timer:15,k:'Lägg den tinade torsken i en form med salt, peppar och citronskivor och baka den.',v:'Skiva halloumin, stek den 2 minuter per sida och pressa över lite citron.'},
 {t:'Koka ärtorna och mixa dem med mjölk, smör och salt.',timer:4},
 {t:'Servera på ärtpurén.'}]},
'insp-kycklingwok':{dv:'tofu',s:[
 {t:'Koka nudlarna och spola dem kalla.',timer:5},
 {t:'Skär grönsakerna tunt.'},
 {g:1,timer:6,k:'Skär kycklingen i strimlor och woka den i het olja tills den fått färg. Lägg den åt sidan.',v:'Pressa ur tofun, tärna den och stek den krispig i en egen panna.'},
 {t:'Woka grönsaker, vitlök och ingefära.',timer:3},
 {t:'Vänd ner nudlar och soja och lägg upp direkt.',k:'Toppa med {kott}.',v:'Toppa med {veg}.'}]},
'insp-flaskfile-apple':{dv:'halloumi',s:[
 {t:'Sätt ugnen på 225 grader. Skär vitkålen i klyftor och äpplet i bitar, vänd med olja, timjan och salt.'},
 {t:'Rosta kål och äpple.',timer:15},
 {g:1,timer:15,k:'Bryn fläskfilén runt om, lägg den på plåten och låt den gå klart tills den håller 65 grader inuti.',v:'Skiva halloumin och stek den 2 minuter per sida när köttet nästan är klart.'},
 {t:'Rör ihop crème fraiche och senap till en sås.'}]},
'insp-mexikansk-kyckling':{dv:'bonor',s:[
 {t:'Skär lök och paprika i bitar.'},
 {g:1,timer:6,k:'Skär kycklingen i bitar och bryn den i olja. Lägg den åt sidan.',v:'Skölj den extra burken bönor.'},
 {t:'Fräs lök, paprika och krydda.'},
 {t:'Häll i tomater, sköljda bönor och majs och låt puttra.',timer:12},
 {t:'Dela grytan i två kastruller och pressa över lime.',k:'Vänd ner {kott} i den ena och låt det bli genomvarmt.',v:'Vänd ner {veg} i den andra.'}]},
'insp-tandoorikyckling':{dv:'halloumi',s:[
 {t:'Blanda 1 dl yoghurt med tandoorikrydda, vitlök och salt.',k:'Vänd {kott} i hälften av marinaden.',v:'Vänd {veg} i den andra hälften.'},
 {t:'Sätt ugnen på 225 grader.'},
 {g:1,timer:20,k:'Grilla kycklingen i ugnen.',v:'Skär halloumin i bitar och grilla dem på en egen plåt de sista 10 minuterna.'},
 {t:'Riv blomkålen grovt och stek den i olja med salt.',timer:5},
 {t:'Riv gurkan och blanda med resten av yoghurten och hackad mynta.'}]},
'insp-latt-stroganoff':{dv:'halloumi',s:[
 {t:'Koka riset.',timer:25},
 {t:'Skär löken i skivor.'},
 {g:1,timer:5,k:'Skär köttet i strimlor och bryn det med hälften av löken.',v:'Skär halloumin i strimlor och stek den med resten av löken i en egen panna.'},
 {t:'Rör ihop tomatpuré, senap och vatten, dela det mellan pannorna och låt sjuda.',timer:5},
 {t:'Dra av från värmen och rör ner kvargen i båda pannorna. Servera med ris och broccoli.'}]},
'insp-kycklingsouvlaki':{dv:'halloumi',s:[
 {t:'Blanda citron, oregano, vitlök, olja och salt till en marinad.',k:'Skär {kott} i bitar och vänd i hälften av marinaden.',v:'Vänd {veg} i den andra hälften.'},
 {g:1,timer:12,k:'Trä kycklingen på spett och grilla eller stek spetten.',v:'Skär halloumin i bitar, trä på egna spett och grilla dem 2 minuter per sida.'},
 {t:'Riv gurkan och blanda med kvarg och lite vitlök.'},
 {t:'Skär tomater, gurka och rödlök och smula över feta.'}]},
'insp-laxwok-teriyaki':{dv:'tofu',s:[
 {t:'Koka riset.',timer:25},
 {t:'Skär grönsakerna i bitar.'},
 {g:1,timer:4,t:'Woka broccoli och morot.',k:'Skär laxen i tärningar och woka den försiktigt i en egen panna.',v:'Tärna tofun och stek den krispig i en egen panna.'},
 {t:'Rör ihop soja, ingefära, vitlök, majsstärkelse och 1 dl vatten, häll över grönsakerna och låt tjockna.',timer:2},
 {t:'Lägg upp och strö över sesamfrön.',k:'Toppa med {kott}.',v:'Toppa med {veg}.'}]},
'insp-flaskkotlett-senap':{dv:'halloumi',s:[
 {t:'Koka potatisen.',timer:20},
 {g:1,timer:8,k:'Skär bort fettkanten, salta och peppra kotletterna och stek dem.',v:'Skiva halloumin och stek den 2 minuter per sida.'},
 {t:'Koka ärtorna.',timer:3},
 {t:'Rör ihop kvarg, senap och salt.'}]},
'insp-vitloksrakor-zucchini':{dv:'halloumi',s:[
 {t:'Skär zucchinin i tunna strimlor med skalare eller spiralskärare.'},
 {t:'Fräs vitlök och chili i olivolja och dela det mellan två pannor.'},
 {g:1,timer:3,k:'Lägg räkorna i den ena pannan och värm dem.',v:'Tärna halloumin och stek den gyllene i den andra pannan.'},
 {t:'Dela zucchinin mellan pannorna och låt den bli varm.',timer:2},
 {t:'Pressa över citron och strö över persilja och parmesan.'}]},
'insp-kyckling-quinoa-lada':{dv:'halloumi',s:[
 {t:'Koka quinoan och låt den svalna.',timer:15},
 {g:1,timer:12,k:'Stek kycklingen och skär den i bitar.',v:'Stek halloumin 2 minuter per sida och skär den i bitar.'},
 {t:'Tärna grönsakerna och skölj bönorna.'},
 {t:'Blanda quinoa, grönsaker och bönor med lime, olja och salt och dela i två lådor.',k:'Lägg {kott} i den ena lådan.',v:'Lägg {veg} i den andra.'}]},
'insp-pestokyckling':{dv:'halloumi',s:[
 {t:'Sätt ugnen på 220 grader.'},
 {g:1,timer:22,t:'Lägg tomater och zucchini i en form.',k:'Lägg kycklingen på ena halvan, bred pesto över och baka tills den är genomstekt.',v:'Lägg halloumin i skivor på andra halvan med lite pesto. Den behöver bara de sista 10 minuterna.'},
 {t:'Koka matvetet.',timer:15},
 {t:'Servera med ruccola.'}]},
'insp-kikartscurry':{dk:'kyckling',s:[
 {t:'Dela blomkålen i små buketter. Hacka lök och vitlök.'},
 {t:'Fräs lök, vitlök och curry i olivolja.'},
 {t:'Tillsätt blomkål, tomater och 1 dl vatten. Låt sjuda under lock.',timer:15},
 {g:1,k:'Skär kycklingen i bitar och stek den i en egen panna tills den är genomstekt.',v:'Skölj kikärtorna.'},
 {t:'Dela curryn i två kastruller.',k:'Vänd ner {kott} i den ena.',v:'Vänd ner {veg} i den andra och låt det bli varmt.'},
 {t:'Blanda yoghurten med hackad koriander och salt. Servera till curryn.'}]},
'insp-tofuwok-cashew':{dk:'kyckling',s:[
 {t:'Koka riset.',timer:25},
 {g:1,timer:8,k:'Skär kycklingen i strimlor och stek den genomstekt i en egen panna.',v:'Tärna tofun och stek den krispig.'},
 {t:'Woka grönsakerna med ingefära.',timer:5},
 {t:'Tillsätt soja och cashew och lägg upp.',k:'Toppa med {kott}.',v:'Toppa med {veg}.'}]},
'insp-tofu-tikka':{dk:'kyckling',s:[
 {t:'Koka riset.',timer:25},
 {g:1,timer:8,k:'Skär kycklingen i bitar och stek den genomstekt.',v:'Tärna och stek tofun gyllene.'},
 {t:'Fräs lök, vitlök, ingefära och garam masala.'},
 {t:'Tillsätt tomaterna och låt puttra.',timer:10},
 {t:'Rör ner yoghurten och dela såsen i två kastruller.',k:'Vänd ner {kott} i den ena.',v:'Vänd ner {veg} i den andra.'}]},
'insp-misosoppa-soba':{dk:'kyckling',s:[
 {t:'Koka nudlarna och skölj dem.',timer:5},
 {t:'Koka upp vattnet med skivad svamp och edamame.',timer:5},
 {g:1,k:'Skär kycklingen i skivor och stek den genomstekt i en egen panna.',v:'Skär tofun i tärningar.'},
 {t:'Rör ut misopastan i lite av vätskan och häll tillbaka. Koka inte efter det.'},
 {t:'Fördela spenat, nudlar och soppa i skålarna och toppa med salladslök.',k:'Lägg {kott} i den ena skålen.',v:'Lägg {veg} i den andra.'}]},
'insp-blomkal-tahini':{dk:'kyckling',s:[
 {t:'Sätt ugnen på 225 grader. Dela blomkålen och vänd den med olja, spiskummin och salt.'},
 {g:1,timer:25,t:'Rosta blomkålen på plåt.',k:'Stek kycklingen i en egen panna tills den är genomstekt.',v:'Vänd kikärtorna med olja och spiskummin och rosta dem på samma plåt.'},
 {t:'Koka bulgurn.',timer:12},
 {t:'Rör ut tahini med citron och vatten till en sås.'},
 {t:'Lägg upp och toppa med granatäpple och persilja.',k:'Lägg {kott} på den ena tallriken.',v:'Lägg {veg} på den andra.'}]},
'insp-pumpasoppa':{dk:'kyckling',s:[
 {t:'Skala och tärna pumpan och hacka löken.'},
 {t:'Fräs lök och ingefära, tillsätt pumpa och buljong och koka mjukt.',timer:25},
 {t:'Mixa slätt och rör i kokosmjölken.'},
 {g:1,timer:8,t:'Rosta pumpafröna med paprika i en torr panna.',k:'Stek kycklingen i bitar med lite rökt paprika tills den är genomstekt.',v:'Rosta kikärtorna med paprika och olja i en panna.'},
 {t:'Toppa soppan med pumpafröna.',k:'Lägg {kott} i den ena skålen.',v:'Lägg {veg} i den andra.'}]},
'insp-bontacos-avokado':{dk:'fars',s:[
 {g:1,k:'Stek färsen smulig med spiskummin, rökt paprika och salt.',v:'Värm bönorna med kryddor och lite vatten och mosa grovt.'},
 {t:'Mosa avokadon med lime och salt.'},
 {t:'Strimla rödkålen och tärna tomaterna.'},
 {t:'Värm tortillorna och fyll dem med avokado, rödkål, tomat och yoghurt.',k:'Fyll med {kott}.',v:'Fyll med {veg}.'}]},
'insp-sotpotatis-svarta-bonor':{dk:'kyckling',s:[
 {t:'Sätt ugnen på 225 grader.'},
 {t:'Baka sötpotatisarna hela.',timer:40},
 {g:1,t:'Värm majsen.',k:'Stek kycklingen med spiskummin och salt tills den är genomstekt.',v:'Värm bönorna med spiskummin och salt.'},
 {t:'Rör ihop yoghurt, limeskal och limesaft.'},
 {t:'Dela potatisarna och fyll dem med majs och limeyoghurt.',k:'Toppa med {kott}.',v:'Toppa med {veg}.'}]},
'insp-sk-kycklinggryta-tomat':{dv:'kikartor',s:[
 {t:'Skär lök och paprika i bitar.'},
 {g:1,k:'Skär kycklingen i bitar och bryn den i omgångar. Lägg den åt sidan.',v:'Skölj kikärtorna.'},
 {t:'Fräs lök, paprika, vitlök och rökt paprika.'},
 {t:'Tillsätt tomater, bönor, buljong och 2 dl vatten och dela grytan i två kastruller.',k:'Lägg {kott} i den ena.',v:'Lägg {veg} i den andra.'},
 {t:'Låt båda puttra.',timer:30},
 {t:'Koka riset och portionera i lådor. Skriv namn på lådorna.',timer:25}]},
'insp-sk-kycklingcurry':{dv:'kikartor',s:[
 {t:'Skär blomkålen i bitar.'},
 {g:1,k:'Skär kycklingen i bitar och bryn den. Lägg den åt sidan.',v:'Skölj kikärtorna.'},
 {t:'Fräs lök, vitlök, ingefära och curry.'},
 {t:'Tillsätt tomater, kokosmjölk och blomkål och dela grytan i två kastruller.',k:'Lägg {kott} i den ena.',v:'Lägg {veg} i den andra.'},
 {t:'Låt båda sjuda.',timer:20},
 {t:'Rör ner spenaten. Koka riset och portionera i lådor. Skriv namn på lådorna.'}]},
'insp-kikartsgryta-storkok':{dk:'kyckling',s:[
 {t:'Hacka lök och vitlök och fräs dem i olivolja med ingefära och kryddor.'},
 {g:1,k:'Skär kycklingen i bitar och bryn den i en egen panna.',v:'Skölj kikärtorna.'},
 {t:'Tillsätt tomater och kokosmjölk och dela grytan i två kastruller.',k:'Lägg {kott} i den ena.',v:'Lägg {veg} i den andra.'},
 {t:'Låt båda puttra.',timer:25},
 {t:'Koka matvetet.',timer:15},
 {t:'Rör ner spenaten i båda grytorna, smaka av och portionera i lådor. Skriv namn på lådorna.'}]},
'insp-sk-marockansk-kikarta':{dk:'kyckling',s:[
 {t:'Hacka lök och vitlök och skär morötterna i bitar.'},
 {t:'Fräs dem med kryddorna.'},
 {g:1,k:'Skär kycklingen i bitar och bryn den i en egen panna.',v:'Skölj kikärtorna.'},
 {t:'Tillsätt tomater och buljong och dela grytan i två kastruller.',k:'Lägg {kott} i den ena.',v:'Lägg {veg} i den andra.'},
 {t:'Låt båda puttra.',timer:30},
 {t:'Koka bulgurn och portionera i lådor. Skriv namn på lådorna.',timer:12}]},
'insp-sk-svart-bongryta':{dk:'kyckling',s:[
 {t:'Tärna sötpotatis och hacka lök och vitlök.'},
 {t:'Fräs lök, vitlök och kryddor.'},
 {g:1,k:'Skär kycklingen i bitar och bryn den i en egen panna.',v:'Skölj bönorna.'},
 {t:'Tillsätt sötpotatis, tomater och 3 dl vatten och dela grytan i två kastruller.',k:'Lägg {kott} i den ena.',v:'Lägg {veg} i den andra.'},
 {t:'Låt båda puttra.',timer:30},
 {t:'Pressa i lime. Koka riset och portionera i lådor. Skriv namn på lådorna.'}]},
'insp-sk-ratatouille-bonor':{dk:'kyckling',s:[
 {t:'Tärna alla grönsaker.'},
 {t:'Fräs lök och vitlök i olivolja, lägg i aubergine och zucchini.'},
 {g:1,k:'Skär kycklingen i bitar och bryn den i en egen panna.',v:'Skölj bönorna.'},
 {t:'Tillsätt paprika, tomater och timjan och dela grytan i två kastruller.',k:'Lägg {kott} i den ena.',v:'Lägg {veg} i den andra.'},
 {t:'Låt båda puttra.',timer:35},
 {t:'Koka bulgurn och portionera i lådor. Skriv namn på lådorna.',timer:12}]},
'insp-sk-veg-gulasch':{dk:'kyckling',s:[
 {t:'Tärna grönsakerna och fräs dem med kryddorna.'},
 {g:1,k:'Skär kycklingen i bitar och bryn den i en egen panna.',v:'Skölj bönorna.'},
 {t:'Tillsätt tomater och buljong och dela grytan i två kastruller.',k:'Lägg {kott} i den ena.',v:'Lägg {veg} i den andra.'},
 {t:'Låt båda puttra.',timer:30},
 {t:'Koka matkornet.',timer:25},
 {t:'Smaka av och portionera i lådor. Skriv namn på lådorna.'}]}
};
