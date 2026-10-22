# Doings Agent Hub – agentramverk

Återställt 13 oktober 2026 från projektets sparade version 7, källkodsversion b35d8329ffdc86b6d53edfabb00fedfb852305f6.

## Det här är underlaget du beställde

Agent Hub ska låta medarbetare ge riktiga uppdrag till namngivna specialister. Avatarerna är kvar: namn, ansikte, ton och röst hjälper användaren hitta rätt kompetens. Förmågan att slutföra arbete ligger i gemensam körmotor, versionerade skills, behörigheter, verktyg och verifierade leveranser.

Arkitekturen gäller flera slags arbete: research, analys, strategi, workshops, lärande, kommunikation, produktion och godkända externa handlingar. Alleima-workshopen är ett möjligt testfall, inte systemets första bindande use case eller hela dess identitet.

## Samverkan

Chief of Staff håller ihop målet och bryter ned det i uppgifter med ägare, beroenden och godkännandekriterier. Specialisterna delar verifierat underlag genom typade överlämningar. Oberoende uppgifter kan köras samtidigt. Iris granskar resultatet oberoende av den som skapade det.

Högerspalten ska visa verkliga händelser från respektive arbetstråd: uppgifter, fynd, blockerare, leveranser och beslut. Röst och text ska styra samma beständiga uppdrag. Ett arbete ska kunna återupptas efter att webbläsaren stängts.

## Vad som finns i källkoden

- Bindande arkitekturdokument och källregister.
- En gemensam Doings Operating System-skill.
- Chief of Staff och tio specialister med varsin SKILL.md och agents/openai.yaml.
- Agentregister med ansvar, routing och standardbehörighet.
- Zod-kontrakt för uppgifter, överlämningar, händelser och handlingskvitton.
- Tolv evalspecifikationer och en strukturell validator.
- Regler för behörighet och förbättringsloop.

## Vad som återstår att koppla in

Den publicerade grunden är specifikationer, skills och validerbara kontrakt. Den är ännu inte en körande agentmotor. Agentregistret och kontrakten måste användas av en backend med beständiga uppdrag, separata arbetstrådar och riktiga systemadaptrar. AI-svar, röstkonversation och specialistproduktion behöver modellåtkomst och runtimekonfiguration.

Tolv evalfall betyder tolv definierade testuppdrag. Strukturell validering av dessa är inte tolv genomförda agentkörningar. Produktens faktiska beteende måste testas separat när runtime är ansluten.

## Källgrund

Originalets källregister har bevarats. Centrala påståenden kontrollerades på nytt den 13 oktober 2026 mot OpenAI och Anthropics egna publikationer: Agents API och GPT-Live den 10 september, skillrekommendationerna den 11 september, harnessmedvetna evals den 23 september, samt Anthropics versionerade agenter och separata sessionströmmar med multiagent_20261001.

Detta är Doings arkitekturbeslut baserade på dessa källor. Det innebär inte att leverantörerna rekommenderar just Doings avatarer eller godkänner implementationen. Originalet innehåller ingen separat primärkälla från Boris Cherny; inga egna påståenden tillskrivs honom här.

## Nästa implementation

1. Bekräfta faktiskt tillgängliga systemverktyg och rätta CRM-adapterns tool_not_found.
2. Välj och konfigurera körmotor och modellåtkomst utifrån kontrakten.
3. Lagra uppdrag, trådar, händelser, leveranser och beslut med stabila identifierare.
4. Koppla Chief of Staff och specialisterna till samma körning.
5. Koppla högerspalten till verkliga händelser, med återanslutning och återupptagning.
6. Testa verkliga uppdrag, blockerade verktyg, återstart och godkända handlingar.
7. Koppla röst till samma uppdrag och behåll text, beslut och leveranser vid byte av kanal.

## Hitta arbetet igen

Öppna Agent Hub och välj Agentramverk i vänstermenyn. Direktlänken använder ?view=framework. Där finns arkitekturen, alla agentinstruktioner, källor, kontrakt och evalfall samlade, med nedladdning av ett komplett paket.
