# App Store Connect metadata (draft)

Everything to type into App Store Connect for the first submission of
**Vote: Better Together** (`com.ahmettceren.voteclaude.rn`, App Store Connect
app `6817733699`): the texts in 13 languages, the URLs, category and age
rating, the App Privacy answers, export compliance, the review note and the
screenshot plan. Nothing here was sent to App Store Connect: the owner
enters it by hand (no API was called). The why behind the review choices is
in docs/APP_REVIEW.md; the legal texts and the controller are in
docs/LEGAL.md.

**Status: draft.** The legal texts the URLs point to are drafts for a lawyer
in Canada, and in Türkiye and the EU/UK before launching there.

## Account, seller and contact

| Field | Value |
| --- | --- |
| Developer account | Apple Developer Program, **Individual** (team `R79UKGUVH8`). VOTEBT is an Ontario sole proprietorship, which is not a separate legal entity, and Apple enrols sole proprietors as individuals |
| Seller name on the App Store | The owner's personal name (Apple shows the individual's legal name for Individual accounts) |
| Copyright | © 2026 VOTEBT |
| App Review contact | The owner's first and last name, a phone number reachable during review, support@votebettertogether.com |
| Support, privacy and legal e-mail | support@votebettertogether.com (the only public address) |
| EU Digital Services Act trader status | Required to distribute in the EU. As a trader, Apple shows the address, phone number and e-mail on the EU App Store page: decide with counsel before choosing EU countries (docs/LEGAL.md › open decision 11, postal address) |

**Guideline 5.1.1(ix).** Apple asks apps that require sensitive user
information to be submitted by a legal entity, not an individual, and App
Review has applied this to dating apps. An Individual account can be
rejected on this point alone. If it happens: answer in Resolution Center that
VOTEBT is a registered Ontario business run by its owner, who is personally
responsible for the service, and that Apple enrols sole proprietors as
individuals. If Apple still requires an organization, incorporating (an
Ontario or federal corporation, then a D-U-N-S number and an Organization
membership, which takes days to weeks) is the way through; the seller name
then becomes the corporation's (docs/LEGAL.md › Canada, Incorporation).

## App information

| Field | Value |
| --- | --- |
| Name | **Vote: Better Together** (21 of 30 characters). The same in every language: it is the brand |
| Primary language | English (U.S.) |
| Bundle ID | `com.ahmettceren.voteclaude.rn` |
| SKU | any internal value, for example `votebt-ios` |
| Primary category | Lifestyle |
| Secondary category | Social Networking |
| Content rights | "Yes, it contains, shows or accesses third-party content, and I have the necessary rights": members' photos and words, licensed to Vote by the Terms of Use (› Your content) |
| Price | Free. No in-app purchases are submitted with this version (purchases are off at launch) |
| Availability | Start where the legal work is done: Canada. Add other countries after the steps in docs/LEGAL.md (EU/UK representative, KVKK registration, US state dating laws) |
| License agreement | Apple's standard EULA, with the Terms of Use link in the description |

## URLs

All under https://votebettertogether.com, uploaded from `legal-site/`
(docs/RELEASE_SETUP.md › Legal site). They must stay exactly like this.

| Field | URL |
| --- | --- |
| Privacy Policy URL (App Privacy) | https://votebettertogether.com/privacy.html |
| Support URL (each language) | https://votebettertogether.com/support.html |
| Marketing URL (optional) | https://votebettertogether.com/ |
| Terms of Use (in the description) | https://votebettertogether.com/terms.html |
| Account deletion (Google Play, and for reviewers who ask) | https://votebettertogether.com/delete-account.html |

Localized pages exist at `/<lang>/privacy.html`, `/<lang>/terms.html` and so
on (`tr`, `de`, `fr`, `es`, `it`, `pt`, `ja`, `ko`, `zh-Hans`, `zh-Hant`, `ar`,
`hi`). The Support URL and the Privacy Policy URL can stay the English ones
in every localization: each page links its other languages.

## Age rating

Vote is a dating app for adults with user-generated content and messaging,
so it is rated **18+**. Apple's questionnaire (updated in 2025 with the 13+,
16+ and 18+ ratings) is answered as below. If the form still shows the older
scheme, the result is 17+.

| Question | Answer | Why |
| --- | --- | --- |
| Parental controls | No | |
| Age assurance | No | Self-declared birth date at sign-up (18+), plus reports of under-18 accounts |
| Unrestricted web access | No | No in-app browser to arbitrary sites |
| User-generated content | Yes | Profiles, photos, prompts, notes |
| Messaging and chat | Yes | Chat between matched or introduced members |
| Advertising | No | |
| Profanity or crude humor | Infrequent or mild | Members write freely; slurs and threats are refused |
| Horror or fear themes | None | |
| Alcohol, tobacco or drug use or references | Infrequent or mild | The optional habits answers (drinking, smoking, cannabis where legal) |
| Mature or suggestive themes | Frequent or intense | A dating app, between adults |
| Sexual content or nudity | None | Not allowed; every new photo is checked by a person first |
| Graphic sexual content and nudity | None | |
| Cartoon, fantasy or realistic violence | None | |
| Medical or treatment information | None | |
| Gambling, simulated gambling, contests, loot boxes | None | |
| Age rating override | **18+** (older scheme: 17+) | Vote admits adults only |

"Made for Kids": No.

## Export compliance

The app uses only the encryption built into iOS for HTTPS and the Keychain,
which is exempt. The build says so (`ITSAppUsesNonExemptEncryption` = false
in `mobile/app.json`), so App Store Connect asks nothing. If it asks: "Does
your app use encryption?" Yes, exempt: only standard encryption provided by
Apple's operating system (HTTPS). No export compliance documents, no French
encryption declaration.

## App Privacy (the nutrition label)

From docs/PRIVACY_PERMISSIONS.md › App Store Connect: App Privacy answers and
the privacy manifest in `mobile/app.json` (`ios.privacyManifests`). Keep the
three in step.

**Does this app collect data?** Yes. **Is any data used to track people?**
No, for every type (no ATT prompt, no advertising identifier, no data
broker, `NSPrivacyTracking` false). **Linked to the person?** Yes, for every
type: everything is tied to the account.

| Category › data type | Collected | Linked | Tracking | Purposes | What it is |
| --- | --- | --- | --- | --- | --- |
| Contact Info › Name | Yes | Yes | No | App Functionality | First name on the profile |
| Contact Info › Email Address | Yes | Yes | No | App Functionality | E-mail sign-in, the address Apple or Google share |
| Sensitive Info › Sensitive Info | Yes | Yes | No | App Functionality | Gender and who you want to see (can reveal orientation), optional beliefs and habits, a diet that can reveal a religion |
| Location › Coarse Location | Yes | Yes | No | App Functionality | City, coordinates on a ~5 km grid. Not precise location |
| User Content › Photos or Videos | Yes | Yes | No | App Functionality | Profile and chat photos |
| User Content › Emails or Text Messages | Yes | Yes | No | App Functionality | In-app chat messages |
| User Content › Other User Content | Yes | Yes | No | App Functionality | Prompts, notes with likes, reads of pairs, reports, support requests |
| Identifiers › User ID | Yes | Yes | No | App Functionality | The account ID |
| Identifiers › Device ID | Yes | Yes | No | App Functionality | The app's own installation ID and install ID (kept by the server as a hash), for sign-in and against ban evasion. No IDFA, no IDFV |
| Usage Data › Product Interaction | Yes | Yes | No | App Functionality, Analytics | Likes, passes, reads, follows; first-party usage counts in Vote's own database (off until opted in in the EU/EEA, UK and Türkiye) |
| Diagnostics › Performance Data | Yes | Yes | No | App Functionality | Client health counts (failures, timeouts, latency) |
| Diagnostics › Crash Data | Only when the build has a Sentry DSN | Yes | No | App Functionality | Scrubbed crash reports. Remove from the answers for a version built without Sentry |
| Other Data › Other Data Types | Yes | Yes | No | App Functionality | Birth date (18+ check, age), birth time and place if added for Today's sky and The sky between you |

**Not collected:** Health & Fitness, Financial Info, Precise Location,
Physical Address, Phone Number, Contacts, Audio, Gameplay Content, Browsing
History, Search History (the city search text goes from the phone straight to
Open-Meteo, answered in real time, and Vote keeps nothing of it), Purchases
(no purchases at launch: add **Purchases › Purchase History**, linked, App
Functionality, in the answers and the manifest when Vote Plus or Vote Max go
on sale), Advertising Data, Other Diagnostic Data.

Two points to decide before submitting (they are not in the manifest yet):
- **Customer Support** (User Content): support requests and appeals written
  in the app are stored with the account. They are listed above under Other
  User Content; Apple also has a Customer Support type, which fits better.
  If chosen, add `NSPrivacyCollectedDataTypeCustomerSupport` to the manifest.
- **Product Personalization**: Discover orders people by how well two
  profiles fit. The answers treat that as App Functionality (the core of a
  dating app), as docs/PRIVACY_PERMISSIONS.md does. Some dating apps declare
  Product Personalization for profile data; either is defensible, but the
  label and the manifest must agree.

If captcha is turned on (docs/AUTH.md › Captcha), its provider receives
device signals: review the Device ID and Diagnostics answers then.

## Review notes

App Store Connect → the version → App Review Information.

| Field | Value |
| --- | --- |
| Sign-in required | Yes |
| User name | `[demo account e-mail]`: an address the owner controls on the domain, for example appreview@votebettertogether.com, never published |
| Password | `[demo account password]`: strong, used nowhere else |
| Contact first name, last name | `[owner's first name]` `[owner's last name]` |
| Phone | `[a number reachable during review]` |
| E-mail | support@votebettertogether.com |
| Attachment | Optional: a 30-second screen recording of reading a pair and accepting an introduction helps with 1.2 and 2.1 questions |
| Notes | Below (about 2,600 of 4,000 characters with the brackets filled in) |

Prepare the demo account and the review city as docs/APP_REVIEW.md › Demo
account and Review city say (e-mail sign-in, complete profile in a city with
pairs to read and people in Discover, a plain free account, checked the day
before on a clean iPhone). Fill in the brackets, and drop a line that isn't
true for the build submitted.

```text
Vote is a dating app built on community reading and two-sided consent.

READING PAIRS (Vote tab)
Members read pairs of two other members and say whether the two make sense together, and what they notice between them (chemistry, vibe, style, personality, spirit). A read is always about the pair, never one person. No screen shows anyone's score, rank or popularity, and nobody can rate a single person's looks.

THE RESULT BELONGS TO THE PAIR
The community's read appears only after at least 5 members have read the pair, and only as words ("Most saw chemistry"), never as a score. Nobody learns who read them. Taking part is asked at sign-up and can be turned off or limited at any time (Settings > Community).

NOBODY CONNECTS WITHOUT A YES
When readers see something between two people, both get a private introduction. A chat opens only if both say yes; a no is never shown. In Discover, a match needs a like from both sides.

SAFETY
- Report or block from every profile, introduction and chat. From the reading screen, tap a photo to open the profile, then ... > Report or block.
- Blocking is immediate and two-sided. Every new photo is checked by a moderator before anyone else sees it.
- Before a hurtful message is sent, the app asks "Are you sure?"; the recipient can report it in one tap. Threats and slurs are refused by the server.
- 18+ only (birth date at sign-up). Community guidelines are accepted at sign-up.
- Settings > Delete account deletes the account at once and revokes Sign in with Apple. Deletion page: https://votebettertogether.com/delete-account.html
- Contact: support@votebettertogether.com

DEMO ACCOUNT
On the welcome screen choose "Continue with email" and use the credentials above. The profile is complete and lives in [review city], so Discover has people and the Vote tab has pairs to read. [It has one conversation with a team member, so chat, report and block can be tried.] No permission is needed: the city is part of the profile, photos come from the system picker, and notifications are optional. Signing in with a new Apple ID starts an empty account, whose city may have no members yet.

NO PURCHASES IN THIS VERSION
Vote is free. There are no in-app purchases or subscriptions in this version.

OPTIONAL EXTRAS
Today's sky (You tab) and "The sky between you" (in a chat, only when both people turn it on) are small astrology readings, labelled as for fun, calculated by Vote's own code. They are off until turned on and never affect who is paired, shown or introduced.

The developer is VOTEBT, a sole proprietorship registered in Ontario, Canada.
```

## Texts

Limits: name 30, subtitle 30, promotional text 170, keywords 100 (comma
separated, no spaces after commas), description 4000. The counts below are
characters. Keywords leave out the words of the name (Apple already indexes
them), competitors' names, and words that frame Vote as rating people
("rate", "score", "hot"). English and Turkish are written in full; the other
languages are short versions of the same ideas (community reading of pairs,
two yeses, no scores on people) for a first release, to be reviewed by a
native speaker. The name is **Vote: Better Together** in every language.

### English

App Store Connect localization: English (U.S.), primary; reuse for English (Canada), English (U.K.), English (Australia).

**Subtitle** (29 of 30)

```text
Your community introduces you
```

**Promotional text** (116 of 170)

```text
Nobody here gets a score. Members read pairs, not people, and an introduction only happens when both of you say yes.
```

**Keywords** (99 of 100)

```text
dating,introductions,matchmaking,community,consent,relationships,singles,meet,couples,pairs,serious
```

**Description** (2094 of 4000)

```text
Vote is a dating app where the community helps two people find each other, and nobody is introduced without saying yes.

READ PAIRS, NOT PEOPLE
In the Vote tab you see two members side by side and say whether the two of them make sense together, and what you notice between them: chemistry, vibe, style, personality, spirit. A read is always about the pair. Nobody gets a score, a rating or a rank, and nobody can judge one person's looks.

THE COMMUNITY'S READ BELONGS TO THE PAIR
What readers saw stays with the two people. It appears only after at least five members have read the pair, and only as words like "Most", "About half" or "Few". Nobody learns who read them.

TWO YESES, ALWAYS
When readers see something between two people, both get a private introduction. A conversation opens only if both say yes. A no is never shown to the other person. In Discover, a match also needs a like from both sides.

PROFILES WITH REAL ANSWERS
Prompts, interests, tastes and "this or that" answers say more than a photo. You choose who sees each part of your profile: everyone, people you might date, your connections or only you. Sensitive answers such as beliefs are optional and asked with their own consent.

KIND BY DESIGN
Before a hurtful message goes, Vote asks "Are you sure?". Under a message that may bother you, it offers a one tap report. Threats and slurs are refused. Every new photo is checked by a person before anyone else sees it.

SAFETY AND PRIVACY
Report or block from any profile, pair, introduction or chat. Blocking is immediate and works both ways. Vote shows your city, never your location, sells no data, shows no ads and uses no tracking. You can export your data or delete your account in the app at any time.

JUST FOR FUN
Today's sky is a short daily reading on your own profile, and The sky between you can open in a chat when both of you turn it on. Both are optional and never decide who you see.

Vote is free and only for adults aged 18 or over.

Terms of Use: https://votebettertogether.com/terms.html
Privacy Policy: https://votebettertogether.com/privacy.html
```

**What’s new in this version** (121)

```text
The first release of Vote. Read pairs in your city, get introduced by the community, and talk only when you both say yes.
```

### Turkish (Türkçe)

App Store Connect localization: Turkish.

**Subtitle** (29 of 30)

```text
Topluluk tanıştırsın, sen seç
```

**Promotional text** (113 of 170)

```text
Burada kimse puanlanmaz. Topluluk kişileri değil çiftleri okur, tanışma da ancak ikiniz de evet dediğinizde olur.
```

**Keywords** (90 of 100)

```text
flört,tanışma,çöpçatan,ilişki,eşleşme,sevgili,topluluk,bekar,evlilik,buluşma,arkadaş,ciddi
```

**Description** (2204 of 4000)

```text
Vote, topluluğun iki kişinin birbirini bulmasına yardım ettiği bir flört uygulaması. Burada kimse evet demeden kimseyle tanıştırılmaz.

KİŞİLERİ DEĞİL, ÇİFTLERİ OKU
Vote sekmesinde iki üyeyi yan yana görürsün ve birbirlerine yakışıp yakışmadıklarını, aralarında ne gördüğünü söylersin: kimya, enerji, tarz, kişilik, ruh. Okuma her zaman çifte aittir. Kimseye puan, not ya da sıra verilmez, kimse tek bir kişinin görünüşünü yargılayamaz.

TOPLULUĞUN OKUMASI ÇİFTE AİTTİR
Okuyanların gördüğü o iki kişide kalır. Ancak en az beş üye çifti okuduktan sonra görünür, o da yalnızca “Çoğu”, “Yarı yarıya” ya da “Azı” gibi sözlerle. Kimse onu kimin okuduğunu öğrenmez.

HER ZAMAN İKİ EVET
Okuyanlar iki kişi arasında bir şey görürse ikisine de özel bir tanışma gelir. Sohbet ancak ikisi de evet derse açılır. Hayır, karşı tarafa asla gösterilmez. Keşfet’te de eşleşme için iki tarafın beğenisi gerekir.

GERÇEK CEVAPLI PROFİLLER
Sorular, ilgi alanları, zevkler ve “bu mu, şu mu” cevapları bir fotoğraftan fazlasını anlatır. Profilinin her bölümünü kimin göreceğini sen seçersin: herkes, tanışma adayları, bağlantıların ya da yalnızca sen. İnançlar gibi hassas cevaplar isteğe bağlıdır ve ayrı bir onayla sorulur.

NAZİKLİK TASARIMIN PARÇASI
Kırıcı bir mesaj gitmeden önce Vote “Emin misin?” diye sorar. Rahatsız edebilecek bir mesajın altında tek dokunuşla şikâyet seçeneği sunar. Tehditler ve hakaretler reddedilir. Her yeni fotoğrafı, başkası görmeden önce bir kişi kontrol eder.

GÜVENLİK VE GİZLİLİK
Her profilden, çiftten, tanışmadan ya da sohbetten şikâyet edebilir veya engelleyebilirsin. Engelleme hemen ve iki yönlü işler. Vote şehrini gösterir, konumunu asla. Veri satmaz, reklam göstermez, izleme yapmaz. Verilerini dışa aktarabilir ya da hesabını uygulamadan dilediğin zaman silebilirsin.

SADECE EĞLENCESİNE
Günün gökyüzü kendi profilinde kısa bir günlük yorumdur. Gökyüzünde ikiniz ise ikiniz de açtığınızda bir sohbette açılabilir. İkisi de isteğe bağlıdır ve kimi gördüğüne asla karar vermez.

Vote ücretsizdir ve yalnızca 18 yaşını doldurmuş yetişkinler içindir.

Kullanım Koşulları: https://votebettertogether.com/tr/terms.html
Gizlilik Politikası: https://votebettertogether.com/tr/privacy.html
```

**What’s new in this version** (108)

```text
Vote’nin ilk sürümü. Şehrindeki çiftleri oku, topluluk seni tanıştırsın, ikiniz de evet dediğinizde konuşun.
```

### German (Deutsch)

App Store Connect localization: German.

**Subtitle** (26 of 30)

```text
Deine Community stellt vor
```

**Promotional text** (127 of 170)

```text
Hier bekommt niemand eine Punktzahl. Mitglieder lesen Paare, keine Personen, und ein Intro gibt es nur, wenn ihr beide Ja sagt.
```

**Keywords** (92 of 100)

```text
dating,partnersuche,kennenlernen,community,singles,beziehung,verkupplung,paare,treffen,liebe
```

**Description** (911 of 4000)

```text
Vote ist eine Dating-App, in der die Community zwei Menschen hilft, sich zu finden. Niemand wird vorgestellt, ohne Ja zu sagen.

Paare lesen, nicht Personen: Im Vote-Tab siehst du zwei Mitglieder nebeneinander und sagst, ob die beiden zusammenpassen und was du zwischen ihnen bemerkst. Niemand bekommt eine Punktzahl, eine Bewertung oder einen Rang.

Was die Community sieht, gehört dem Paar: Es erscheint erst, wenn mindestens fünf Mitglieder das Paar gelesen haben, und nur in Worten wie „Die meisten“ oder „Wenige“. Niemand erfährt, wer gelesen hat.

Immer zwei Jas: Ein Chat öffnet sich erst, wenn beide Ja sagen. Ein Nein wird nie gezeigt.

Du entscheidest, wer welchen Teil deines Profils sieht. Melden und Blockieren geht überall, jedes neue Foto prüft ein Mensch, und Vote verkauft keine Daten und zeigt keine Werbung. Kostenlos, ab 18.

Nutzungsbedingungen: https://votebettertogether.com/de/terms.html
```

**What’s new in this version** (136)

```text
Die erste Version von Vote. Lies Paare in deiner Stadt, lass dich von der Community vorstellen und schreib erst, wenn ihr beide Ja sagt.
```

### French (Français)

App Store Connect localization: French (France); reuse for French (Canada).

**Subtitle** (25 of 30)

```text
La communauté te présente
```

**Promotional text** (142 of 170)

```text
Ici, personne n’a de note. Les membres lisent des paires, pas des personnes, et une présentation n’a lieu que si vous dites oui tous les deux.
```

**Keywords** (93 of 100)

```text
rencontre,rencontres,celibataire,couple,amour,communaute,relation,presentation,serieux,paires
```

**Description** (967 of 4000)

```text
Vote est une application de rencontre où la communauté aide deux personnes à se trouver, et où personne n’est présenté sans avoir dit oui.

Lire des paires, pas des personnes : dans l’onglet Vote, tu vois deux membres côte à côte et tu dis s’ils vont bien ensemble et ce que tu remarques entre eux. Personne n’a de note, de classement ou de score.

Ce que voit la communauté appartient à la paire : cela n’apparaît qu’après au moins cinq lectures, et seulement avec des mots comme « La plupart » ou « Peu ». Personne ne sait qui a lu.

Toujours deux oui : une conversation ne s’ouvre que si vous dites oui tous les deux. Un non n’est jamais montré.

Tu choisis qui voit chaque partie de ton profil. Signaler et bloquer, c’est possible partout, chaque nouvelle photo est vérifiée par une personne, et Vote ne vend aucune donnée et n’affiche aucune publicité. Gratuit, réservé aux 18 ans et plus.

Conditions d’utilisation : https://votebettertogether.com/fr/terms.html
```

**What’s new in this version** (146)

```text
La première version de Vote. Lis des paires dans ta ville, laisse la communauté te présenter et discute seulement si vous dites oui tous les deux.
```

### Spanish (Español)

App Store Connect localization: Spanish (Mexico); reuse for Spanish (Spain) with a review.

**Subtitle** (24 of 30)

```text
Tu comunidad te presenta
```

**Promotional text** (129 of 170)

```text
Aquí nadie recibe una puntuación. Los miembros leen parejas, no personas, y una presentación solo ocurre si los dos dicen que sí.
```

**Keywords** (90 of 100)

```text
citas,conocer gente,solteros,pareja,amor,comunidad,relaciones,presentaciones,serio,parejas
```

**Description** (860 of 4000)

```text
Vote es una app de citas donde la comunidad ayuda a dos personas a encontrarse, y nadie es presentado sin decir que sí.

Lee parejas, no personas: en la pestaña Vote ves a dos miembros juntos y dices si tienen sentido como pareja y qué notas entre ellos. Nadie recibe una puntuación, una calificación ni un puesto.

Lo que ve la comunidad es de la pareja: aparece solo cuando al menos cinco miembros han leído la pareja, y solo con palabras como “La mayoría” o “Pocos”. Nadie sabe quién leyó.

Siempre dos síes: una conversación se abre solo si los dos dicen que sí. Un no nunca se muestra.

Tú eliges quién ve cada parte de tu perfil. Puedes reportar y bloquear desde cualquier lugar, una persona revisa cada foto nueva, y Vote no vende datos ni muestra anuncios. Gratis, solo para mayores de 18.

Términos de uso: https://votebettertogether.com/es/terms.html
```

**What’s new in this version** (129)

```text
La primera versión de Vote. Lee parejas en tu ciudad, deja que la comunidad te presente y habla solo cuando los dos digan que sí.
```

### Italian (Italiano)

App Store Connect localization: Italian.

**Subtitle** (28 of 30)

```text
La tua community ti presenta
```

**Promotional text** (124 of 170)

```text
Qui nessuno riceve un punteggio. I membri leggono coppie, non persone, e una presentazione avviene solo se dite sì entrambi.
```

**Keywords** (91 of 100)

```text
incontri,appuntamenti,single,coppia,amore,community,relazioni,presentazioni,conoscere,seria
```

**Description** (837 of 4000)

```text
Vote è un’app di incontri in cui la community aiuta due persone a trovarsi, e nessuno viene presentato senza dire sì.

Leggi coppie, non persone: nella scheda Vote vedi due membri affiancati e dici se insieme hanno senso e cosa noti tra loro. Nessuno riceve un punteggio, un voto o una classifica.

Quello che vede la community appartiene alla coppia: compare solo dopo almeno cinque letture, e solo con parole come “La maggior parte” o “Pochi”. Nessuno sa chi ha letto.

Sempre due sì: una conversazione si apre solo se dite sì entrambi. Un no non viene mai mostrato.

Scegli tu chi vede ogni parte del profilo. Puoi segnalare e bloccare ovunque, ogni nuova foto è controllata da una persona, e Vote non vende dati e non mostra pubblicità. Gratis, solo per maggiorenni.

Termini di utilizzo: https://votebettertogether.com/it/terms.html
```

**What’s new in this version** (128)

```text
La prima versione di Vote. Leggi coppie nella tua città, fatti presentare dalla community e scrivi solo quando dite sì entrambi.
```

### Portuguese, Brazil (Português)

App Store Connect localization: Portuguese (Brazil).

**Subtitle** (29 of 30)

```text
Sua comunidade apresenta você
```

**Promotional text** (120 of 170)

```text
Aqui ninguém ganha nota. Os membros leem pares, não pessoas, e uma apresentação só acontece quando vocês dois dizem sim.
```

**Keywords** (94 of 100)

```text
namoro,encontros,solteiros,relacionamento,amor,comunidade,conhecer pessoas,casal,apresentações
```

**Description** (818 of 4000)

```text
O Vote é um app de namoro em que a comunidade ajuda duas pessoas a se encontrarem, e ninguém é apresentado sem dizer sim.

Leia pares, não pessoas: na aba Vote você vê dois membros lado a lado e diz se eles combinam e o que percebe entre os dois. Ninguém ganha nota, avaliação ou ranking.

O que a comunidade vê pertence ao par: só aparece depois que pelo menos cinco membros leram o par, e só com palavras como “A maioria” ou “Poucos”. Ninguém sabe quem leu.

Sempre dois sins: uma conversa só abre se os dois disserem sim. Um não nunca é mostrado.

Você escolhe quem vê cada parte do seu perfil. Dá para denunciar e bloquear em qualquer lugar, uma pessoa confere cada foto nova, e o Vote não vende dados nem mostra anúncios. Grátis, só para maiores de 18.

Termos de uso: https://votebettertogether.com/pt/terms.html
```

**What’s new in this version** (130)

```text
A primeira versão do Vote. Leia pares na sua cidade, deixe a comunidade apresentar você e converse só quando os dois disserem sim.
```

### Japanese (日本語)

App Store Connect localization: Japanese.

**Subtitle** (14 of 30)

```text
コミュニティが紹介してくれる
```

**Promotional text** (57 of 170)

```text
ここでは誰も点数をつけられません。メンバーが読むのは人ではなくペア。紹介は、ふたりともイエスと言ったときだけです。
```

**Keywords** (39 of 100)

```text
恋活,婚活,出会い,マッチング,恋人,コミュニティ,紹介,真剣,カップル,ペア
```

**Description** (433 of 4000)

```text
Vote は、コミュニティがふたりの出会いを手伝う恋愛アプリです。イエスと言わないかぎり、誰も紹介されません。

人ではなく、ペアを読む：Vote タブでは、ふたりのメンバーが並んで表示され、ふたりが合いそうか、ふたりの間に何を感じるかを答えます。誰かに点数や評価、順位がつくことはありません。

コミュニティの読みはペアのもの：少なくとも5人が読んだあとに、「多くの人」「少しの人」といった言葉でだけ表示されます。誰が読んだかは誰にもわかりません。

いつもふたつのイエス：会話が始まるのは、ふたりともイエスと言ったときだけ。ノーが相手に伝わることはありません。

プロフィールのどの部分を誰に見せるかは自分で選べます。通報とブロックはどこからでもでき、新しい写真はすべて人が確認します。Vote はデータを売らず、広告も表示しません。無料、18歳以上限定です。

利用規約：https://votebettertogether.com/ja/terms.html
```

**What’s new in this version** (58)

```text
Vote の最初のバージョンです。街のペアを読み、コミュニティに紹介してもらい、ふたりともイエスのときだけ話せます。
```

### Korean (한국어)

App Store Connect localization: Korean.

**Subtitle** (15 of 30)

```text
커뮤니티가 소개해 주는 만남
```

**Promotional text** (71 of 170)

```text
여기서는 누구도 점수를 받지 않습니다. 회원들은 사람이 아니라 커플을 읽고, 소개는 두 사람 모두 예라고 할 때만 이루어집니다.
```

**Keywords** (36 of 100)

```text
데이트,소개팅,연애,만남,싱글,커뮤니티,커플,진지한만남,인연,소개
```

**Description** (464 of 4000)

```text
Vote는 커뮤니티가 두 사람의 만남을 돕는 데이트 앱입니다. 예라고 하지 않으면 누구도 소개되지 않습니다.

사람이 아니라 커플을 읽어요: Vote 탭에서 두 회원을 나란히 보고, 두 사람이 어울리는지, 둘 사이에서 무엇이 느껴지는지 답합니다. 누구도 점수나 평가, 순위를 받지 않습니다.

커뮤니티의 읽기는 커플의 것: 최소 다섯 명이 읽은 뒤에만 “대부분”, “소수” 같은 말로 보입니다. 누가 읽었는지는 아무도 모릅니다.

언제나 두 번의 예: 대화는 두 사람 모두 예라고 할 때만 열립니다. 아니요는 상대에게 절대 보이지 않습니다.

프로필의 각 부분을 누가 볼지는 직접 정합니다. 신고와 차단은 어디서나 할 수 있고, 새 사진은 모두 사람이 확인합니다. Vote는 데이터를 팔지 않고 광고도 없습니다. 무료, 만 18세 이상.

이용약관: https://votebettertogether.com/ko/terms.html
```

**What’s new in this version** (66)

```text
Vote의 첫 버전입니다. 내 도시의 커플을 읽고, 커뮤니티의 소개를 받고, 두 사람 모두 예라고 할 때만 대화하세요.
```

### Chinese, Simplified (简体中文)

App Store Connect localization: Chinese (Simplified).

**Subtitle** (7 of 30)

```text
让社区为你牵线
```

**Promotional text** (44 of 170)

```text
在这里，没有人会被打分。成员们看的是一对人，而不是一个人。只有你们都说愿意，才会被引荐。
```

**Keywords** (31 of 100)

```text
交友,约会,恋爱,脱单,牵线,社区,单身,认真恋爱,相亲,引荐
```

**Description** (340 of 4000)

```text
Vote 是一款由社区帮助两个人相遇的交友应用。没有人会在未说愿意的情况下被引荐。

看一对人，而不是一个人：在 Vote 标签页中，你会看到两位成员并排出现，说说他们是否合适，以及你在他们之间看到了什么。没有人会被打分、评级或排名。

社区的看法属于这一对：至少五位成员看过之后才会显示，而且只用“大多数”“少数”这样的词。没有人知道是谁看过。

永远需要两个愿意：只有你们都说愿意，对话才会开启。拒绝永远不会让对方看到。

个人资料的每个部分给谁看，由你决定。举报和屏蔽随处可用，每张新照片都由真人审核。Vote 不出售数据，也没有广告。免费，仅限 18 岁以上。

使用条款：https://votebettertogether.com/zh-Hans/terms.html
```

**What’s new in this version** (46)

```text
Vote 的第一个版本。看看你所在城市的配对，让社区为你牵线，只有你们都说愿意时才开始聊天。
```

### Chinese, Traditional (繁體中文)

App Store Connect localization: Chinese (Traditional).

**Subtitle** (7 of 30)

```text
讓社群為你牽線
```

**Promotional text** (45 of 170)

```text
在這裡，沒有人會被打分數。成員們看的是一對人，而不是一個人。只有你們都說願意，才會被引薦。
```

**Keywords** (31 of 100)

```text
交友,約會,戀愛,脫單,牽線,社群,單身,認真交往,聯誼,引薦
```

**Description** (342 of 4000)

```text
Vote 是一款由社群幫助兩個人相遇的交友 App。沒有人會在未說願意的情況下被引薦。

看一對人，而不是一個人：在 Vote 分頁中，你會看到兩位成員並排出現，說說他們是否適合，以及你在他們之間看到了什麼。沒有人會被打分數、評等或排名。

社群的看法屬於這一對：至少五位成員看過之後才會顯示，而且只用「大多數」「少數」這樣的詞。沒有人知道是誰看過。

永遠需要兩個願意：只有你們都說願意，對話才會開啟。拒絕永遠不會讓對方看到。

個人檔案的每個部分給誰看，由你決定。檢舉和封鎖隨處可用，每張新照片都由真人審核。Vote 不販售資料，也沒有廣告。免費，僅限 18 歲以上。

使用條款：https://votebettertogether.com/zh-Hant/terms.html
```

**What’s new in this version** (46)

```text
Vote 的第一個版本。看看你所在城市的配對，讓社群為你牽線，只有你們都說願意時才開始聊天。
```

### Arabic (العربية)

App Store Connect localization: Arabic.

**Subtitle** (27 of 30)

```text
مجتمعك يعرّفك على من يناسبك
```

**Promotional text** (103 of 170)

```text
لا أحد هنا يحصل على تقييم. يقرأ الأعضاء ثنائيات لا أشخاصًا، ولا يحدث التعارف إلا عندما يقول كلاكما نعم.
```

**Keywords** (60 of 100)

```text
تعارف,مواعدة,زواج,ارتباط,حب,مجتمع,عزاب,علاقة جدية,لقاء,ثنائي
```

**Description** (735 of 4000)

```text
تطبيق Vote للتعارف يساعد فيه المجتمع شخصين على أن يجد أحدهما الآخر، ولا يُعرَّف أحد على أحد من دون أن يقول نعم.

اقرأ الثنائيات لا الأشخاص: في تبويب Vote ترى عضوين جنبًا إلى جنب، وتقول هل يبدوان مناسبين معًا وما الذي تلاحظه بينهما. لا أحد يحصل على درجة أو تقييم أو ترتيب.

ما يراه المجتمع ملك للثنائي: لا يظهر إلا بعد أن يقرأ الثنائي خمسة أعضاء على الأقل، وبكلمات مثل «معظمهم» أو «قليلون» فقط. لا أحد يعرف من قرأ.

دائمًا نعمان: لا تبدأ المحادثة إلا إذا قال كلاكما نعم. ولا يظهر الرفض للطرف الآخر أبدًا.

أنت تختار من يرى كل جزء من ملفك. يمكنك الإبلاغ والحظر من أي مكان، ويراجع شخص كل صورة جديدة، ولا يبيع Vote البيانات ولا يعرض إعلانات. مجاني، وللبالغين من 18 عامًا فأكثر.

شروط الاستخدام: https://votebettertogether.com/ar/terms.html
```

**What’s new in this version** (101)

```text
الإصدار الأول من Vote. اقرأ الثنائيات في مدينتك، ودع المجتمع يعرّفك، وتحدث فقط عندما يقول كلاكما نعم.
```

### Hindi (हिन्दी)

App Store Connect localization: Hindi.

**Subtitle** (25 of 30)

```text
आपकी कम्युनिटी परिचय कराए
```

**Promotional text** (115 of 170)

```text
यहाँ किसी को अंक नहीं मिलते। सदस्य लोगों को नहीं, जोड़ियों को पढ़ते हैं, और परिचय तभी होता है जब आप दोनों हाँ कहें।
```

**Keywords** (76 of 100)

```text
डेटिंग,रिश्ता,प्यार,मुलाक़ात,सिंगल,कम्युनिटी,जोड़ी,परिचय,गंभीर रिश्ता,dating
```

**Description** (890 of 4000)

```text
Vote एक डेटिंग ऐप है जिसमें कम्युनिटी दो लोगों को एक-दूसरे तक पहुँचने में मदद करती है, और हाँ कहे बिना किसी का परिचय नहीं होता।

लोगों को नहीं, जोड़ियों को पढ़ें: Vote टैब में आप दो सदस्यों को साथ-साथ देखते हैं और बताते हैं कि क्या दोनों साथ में जँचते हैं और आपको उनके बीच क्या दिखता है। किसी को अंक, रेटिंग या रैंक नहीं मिलती।

कम्युनिटी की राय जोड़ी की है: यह तभी दिखती है जब कम से कम पाँच सदस्य जोड़ी को पढ़ लें, और सिर्फ़ “ज़्यादातर” या “कुछ ही” जैसे शब्दों में। किसी को पता नहीं चलता कि किसने पढ़ा।

हमेशा दो हाँ: बातचीत तभी खुलती है जब आप दोनों हाँ कहें। ना कभी दूसरे व्यक्ति को नहीं दिखती।

आपकी प्रोफ़ाइल का हर हिस्सा कौन देखे, यह आप चुनते हैं। रिपोर्ट और ब्लॉक हर जगह से हो सकता है, हर नई फ़ोटो एक इंसान जाँचता है, और Vote डेटा नहीं बेचता, विज्ञापन नहीं दिखाता। मुफ़्त, सिर्फ़ 18 साल और उससे ज़्यादा उम्र वालों के लिए।

उपयोग की शर्तें: https://votebettertogether.com/hi/terms.html
```

**What’s new in this version** (116)

```text
Vote का पहला वर्ज़न। अपने शहर की जोड़ियाँ पढ़ें, कम्युनिटी को परिचय कराने दें, और तभी बात करें जब आप दोनों हाँ कहें।
```


## Screenshots

iPhone only (`supportsTablet: false`). Two sets of the same 8 screens:
**6.9"** (1320 × 2868 portrait, iPhone 16 Pro Max / 17 Pro Max) and **6.5"**
(1284 × 2778 portrait, iPhone 14 Plus; 1242 × 2688 also accepted). App Store
Connect needs at least the 6.9" set and scales it down when no 6.5" set is
given; uploading both keeps the captions sharp on older phones.

How to capture: a release build on the simulator or a phone, signed in with
the demo account in the review city, light appearance, the clock at 9:41,
full battery, no notifications. Use only photos of people who agreed (team
members, testers who said yes in writing, or licensed stock), modest
(guideline 2.3.8: screenshots must suit all audiences, whatever the age
rating), no real member's face or name without consent. Show the reading of
a pair and the introduction first: what makes Vote different (4.3(b)) and
what shows it is not "hot or not" voting (1.2). Astrology comes last, if at
all. Captions sit above the phone, in the app's typefaces (Fraunces for the
caption, Inter for the line under it), on the app's background colour.

| # | Screen | How to get there | Caption (EN) | Caption (TR) |
| --- | --- | --- | --- | --- |
| 1 | Reading a pair, both photos and the lenses | Vote tab, Nearby | Read pairs, not people | Kişileri değil, çiftleri oku |
| 2 | A pair's community result in words ("Most saw chemistry") | Vote tab, after answering a pair that has 5+ reads | The community sees the pair. Nobody gets a score | Topluluk çifti görür. Kimse puanlanmaz |
| 3 | An introduction waiting for two yeses | Connections, an introduction | An introduction needs two yeses | Tanışma için iki evet gerekir |
| 4 | A profile with prompts and "this or that" answers | Discover, a profile | Profiles with real answers | Gerçek cevaplı profiller |
| 5 | A chat with the "Are you sure?" check | A chat, typing a hurtful word (staged with a team member) | Kind words, by design | Naziklik, tasarımın parçası |
| 6 | Who sees each part of the profile | You › Edit profile, an audience picker | You choose who sees each part | Her bölümü kimin göreceğini sen seç |
| 7 | Report or block from a profile's menu | A profile › ... | Report or block from anywhere | Her yerden şikâyet et ya da engelle |
| 8 (optional) | Today's sky with its "for fun" label | You tab, after turning it on | Today's sky, just for fun | Günün gökyüzü, sadece eğlencesine |

For the other 11 languages, either reuse the English set (App Store Connect
falls back to the primary language) or caption the same screens in each
language, with the app switched to that language. Never show text in one
language with a caption in another.

## Before entering it

- [ ] The legal site is uploaded and every URL above opens (docs/RELEASE_SETUP.md › Legal site).
- [ ] The demo account and review city are ready (docs/APP_REVIEW.md).
- [ ] The App Privacy answers match the manifest of the build submitted (Crash Data only with Sentry).
- [ ] The texts say nothing the build doesn't do: no plans or purchases, Today's sky named as in the build.
- [ ] Keywords: no spaces after commas, no competitor names, nothing from the name repeated.
