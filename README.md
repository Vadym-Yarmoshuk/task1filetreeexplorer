# FileTree Explorer

Aplikacja do wizualizacji struktury katalogów zapisanej w JSON. Użytkownik wkleja albo wgrywa plik JSON. Aplikacja pokazuje drzewo, szczegóły każdego węzła i wyniki wyszukiwania po nazwie.

**Stack:** React 19, TypeScript (`strict`), React Router v6, Vite 8, Material UI 9, `@tanstack/react-virtual`, Vitest + React Testing Library.

## Uruchomienie

```bash
npm install && npm run dev
```

Aplikacja działa pod adresem http://localhost:5173.

**Wymagania:** Node.js 22.12 lub nowszy (zalecany 24, plik `.nvmrc`). Zadanie wymaga „Node.js 18+”, ale Vite 8, Vitest 5 i ESLint 10 nie działają na Node starszym niż 22.12. Node 18 i 20 nie mają już wsparcia. Plik `.npmrc` (`engine-strict=true`) powoduje, że na starszej wersji `npm install` od razu pokazuje czytelny błąd. Jeśli używasz `nvm`, wykonaj `nvm use`.

### Skrypty

| Skrypt                  | Działanie                                             |
| ----------------------- | ----------------------------------------------------- |
| `npm run dev`           | Serwer deweloperski                                   |
| `npm run build`         | Typecheck i build produkcyjny                         |
| `npm run preview`       | Podgląd buildu produkcyjnego                          |
| `npm test`              | Testy jednostkowe i komponentów                       |
| `npm run test:coverage` | Testy z raportem pokrycia i progami                   |
| `npm run lint`          | ESLint (z wymaganym JSDoc)                            |
| `npm run typecheck`     | TypeScript bez buildu                                 |
| `npm run format:check`  | Sprawdzenie formatowania (Prettier)                   |
| `npm run generate:tree` | Generuje duże drzewo testowe do `examples/generated/` |

### Przykładowe dane

Folder [`examples/`](examples/) zawiera pliki do wgrania:

| Plik                          | Zawartość                                                                                             |
| ----------------------------- | ----------------------------------------------------------------------------------------------------- |
| `basic.json`                  | Przykład z treści zadania                                                                             |
| `web-project.json`            | Realistyczny projekt: pusty folder, plik 0 B, plik ponad 20 MB, spacje, `#` i polskie znaki w nazwach |
| `invalid-missing-size.json`   | Plik bez pola `size`                                                                                  |
| `invalid-duplicate-name.json` | Dwa węzły o tej samej nazwie w jednym folderze                                                        |
| `invalid-syntax.json`         | Błąd składni JSON                                                                                     |

Na stronie głównej są też przyciski „Wstaw przykład” (drzewo z zadania) i „Duży przykład” (55 555 węzłów).

## Funkcje

| Ścieżka           | Widok                                                                                                                 |
| ----------------- | --------------------------------------------------------------------------------------------------------------------- |
| `/`               | Wklejanie JSON, upload pliku (przycisk albo przeciągnięcie), komunikat błędu z lokalizacją, np. `$.children[0]`       |
| `/tree`           | Drzewo z rozwijaniem i zwijaniem folderów, obsługa klawiatury, wyszukiwanie                                           |
| `/tree?q=fraza`   | Wyniki wyszukiwania w całym drzewie, z pełną ścieżką każdego wyniku                                                   |
| `/tree/:nodePath` | Szczegóły pliku (nazwa, rozmiar B/KB/MB, pełna ścieżka) albo folderu (liczba dzieci, rozmiar poddrzewa, lista dzieci) |

Dodatkowo:

- **Breadcrumbs, „Folder nadrzędny” i „Pokaż w drzewie”.** Ostatni przycisk rozwija foldery nadrzędne i ustawia fokus na węźle.
- **Kopiowanie pełnej ścieżki do schowka.**
- **Klawiatura w drzewie** (wzorzec WAI-ARIA Tree View): `↑` `↓` ruch, `→` `←` rozwiń / zwiń / przejdź do rodzica, `Home` / `End`, `Enter` szczegóły, `Spacja` rozwiń / zwiń, `*` rozwiń poziom, litera – następny węzeł na tę literę.
- **Stan po odświeżeniu strony:** wczytane drzewo, fraza wyszukiwania i rozwinięte foldery zostają.
- **Deep link bez danych:** adres `/tree/...` otwarty bez wczytanego drzewa przekierowuje na `/`. Po wczytaniu JSON aplikacja wraca na ten adres.

## Decyzje architektoniczne

### Indeks zamiast drzewa w komponentach

Po wczytaniu JSON aplikacja raz buduje indeks `Map<ścieżka, węzeł>` ([`buildIndex.ts`](src/domain/buildIndex.ts)). Każdy węzeł ma już policzone: ścieżkę, rodzica, głębokość, pozycję wśród rodzeństwa i rozmiar poddrzewa. Dzięki temu:

- szczegóły węzła z URL to jedno wyszukanie w mapie (O(1)),
- rozmiar folderu nie jest liczony przy każdym renderowaniu,
- wyszukiwanie przechodzi po płaskiej liście, a nie po drzewie.

Logika jest w [`src/domain/`](src/domain/) jako czyste funkcje bez Reacta. Łatwo ją testować (100% pokrycia linii).

### Brak rekurencji – dowolna głębokość

Zadanie mówi o strukturze „dowolnie głęboko zagnieżdżonej”. Walidacja, indeksowanie, spłaszczanie i wyszukiwanie używają jawnego stosu, a nie rekurencji. Test sprawdza drzewo o głębokości 100 000 poziomów.

### Własny walidator zamiast zod

Na początku planowałem `zod`. Test pokazał, że rekurencyjny schemat zod przepełnia stos już przy głębokości 1000. Własny walidator ([`parseTree.ts`](src/domain/parseTree.ts)) działa iteracyjnie i zwraca komunikat po polsku z lokalizacją błędu, np. „Plik "App.tsx": pole "size" musi być liczbą większą lub równą 0.” w `$.children[0].children[1]`.

Walidator odrzuca też dwa węzły o tej samej nazwie w jednym folderze i nazwy ze znakiem `/`. Bez tego ścieżka w URL mogłaby wskazywać więcej niż jeden węzeł.

### Wirtualizacja

Drzewo, wyniki wyszukiwania i lista dzieci folderu renderują tylko wiersze widoczne na ekranie (`@tanstack/react-virtual`). Dlatego drzewo jest płaską listą widocznych węzłów ([`flattenVisible.ts`](src/domain/flattenVisible.ts)) z wcięciem zależnym od głębokości, a nie zagnieżdżonymi komponentami. Test z ponad 12 000 rozwiniętych węzłów sprawdza, że w DOM jest mniej niż 100 wierszy.

Fokus klawiatury jest na kontenerze drzewa (`aria-activedescendant`), a nie na wierszu. Wiersz może zniknąć z DOM po przewinięciu, a fokus nie ginie. Wiersze mają `aria-level`, `aria-setsize` i `aria-posinset`, bo w DOM nie ma wszystkich elementów.

### Stan w URL i w przeglądarce

| Dane               | Miejsce                 | Powód                                                                 |
| ------------------ | ----------------------- | --------------------------------------------------------------------- |
| Fraza wyszukiwania | URL (`?q=`)             | Przetrwa odświeżenie, link można udostępnić, działa przycisk „Wstecz” |
| Wybrany węzeł      | URL (`/tree/:nodePath`) | Wymaganie zadania, deep link                                          |
| Wczytany JSON      | `localStorage`          | Bez tego `/tree/...` nie działa po odświeżeniu strony                 |
| Rozwinięte foldery | `sessionStorage`        | Stan widoku, który nie powinien przetrwać zamknięcia karty            |

Do `localStorage` trafia oryginalny tekst JSON, a nie wynik `JSON.stringify`, bo `JSON.stringify` przepełnia stos przy bardzo głębokim drzewie. Pole wyszukiwania zapisuje frazę w URL po 250 ms bez pisania (`replace`, bez nowych wpisów w historii).

Stan drzewa jest w React Context ([`TreeDataProvider.tsx`](src/store/TreeDataProvider.tsx)). Biblioteka stanu (Redux, Zustand) nie była potrzebna: jest jeden obiekt, który zmienia się tylko przy wczytaniu albo wyczyszczeniu.

### Kodowanie ścieżki w URL

`nodePath` jest kodowany przez `encodeURIComponent`, więc `src/components/Button.tsx` daje `/tree/src%2Fcomponents%2FButton.tsx`. Test wykazał, że React Router v6 dekoduje parametr dwa razy: nazwa pliku, która dosłownie zawiera `%2F`, prowadziła do złego węzła. Dlatego [`useNodePathParam.ts`](src/features/details/useNodePathParam.ts) czyta surowy `location.pathname` i dekoduje go raz. Wszystkie adresy buduje jedno miejsce: [`routes.ts`](src/app/routes.ts).

### Struktura katalogów

```
src/
  app/         routing, layout, motyw MUI, strona 404, guard RequireTree
  components/  wspólne komponenty (VirtualList, NodeIcon)
  domain/      czysta logika bez Reacta: typy, walidacja, indeks, wyszukiwanie, formatowanie
  features/    upload, tree, details, search – każdy widok z własnymi komponentami i hookami
  store/       Context z danymi drzewa, zapis w localStorage i sessionStorage
  test/        konfiguracja testów, fixtures, renderApp
```

### Jakość kodu

- **TypeScript `strict`** i `noUncheckedIndexedAccess`.
- **JSDoc** (opis, `@param`, `@returns`) dla każdej funkcji, hooka i komponentu. ESLint (`eslint-plugin-jsdoc`) zgłasza brak opisu.
- **202 testy** (Vitest + React Testing Library). Pokrycie: około 97% całości i 100% linii w `domain/`. Progi pokrycia: 90% dla `domain/`, 70% dla całości.
- **CI** w GitHub Actions ([`ci.yml`](.github/workflows/ci.yml)): Prettier, ESLint, typecheck, testy z pokryciem i build przy każdym `push` i pull requeście.
- **Interfejs po polsku**, z poprawną odmianą liczebników („1 plik”, „3 pliki”, „5 plików”).

## Znane ograniczenia

- **Nazwy z `/` i duplikaty nazw w jednym folderze są odrzucane.** Bez tego ścieżka nie jest jednoznaczna. Inny format URL (np. indeksy dzieci) by to rozwiązał, ale adres byłby nieczytelny.
- **Pamięć przy bardzo głębokim drzewie.** Każdy węzeł przechowuje pełną ścieżkę, więc przy tysiącach poziomów zużycie pamięci rośnie kwadratowo, a URL szczegółów jest bardzo długi.
- **Limit `localStorage` (około 5 MB).** Większy JSON działa, ale nie przetrwa odświeżenia strony. Aplikacja pokazuje wtedy ostrzeżenie.
- **Parsowanie i indeksowanie blokują wątek główny.** Dla 55 555 węzłów trwa to krótko, ale dla plików rzędu setek MB interfejs na chwilę się zatrzyma.
- **Stała wysokość wiersza.** Długie nazwy są obcinane. Pełna nazwa jest w podpowiedzi po najechaniu myszą.
- **Wyszukiwanie tylko po fragmencie nazwy**, bez rozróżniania wielkości liter. Nie ma wyszukiwania rozmytego ani wyrażeń regularnych.
- **React Router v6 ma 2 podatności o poziomie „moderate”** (`npm audit`). Poprawka jest tylko w v7, a zadanie wymaga v6. Open redirect przez `\` w `<Link>` nas nie dotyczy, bo wszystkie ścieżki są kodowane przez `encodeURIComponent`. Druga podatność dotyczy SSR, którego aplikacja nie używa.
- **Testowane tylko w jsdom.** Wirtualizacja i klawiatura mają testy komponentów z zamockowanym rozmiarem kontenera. Brak testów w prawdziwej przeglądarce.

## Co zrobiłbym przy większej ilości czasu

### Interfejs (UI/UX)

- **Motyw jasny i ciemny** z przełącznikiem w `AppBar`. Domyślnie motyw z ustawień systemu (`prefers-color-scheme`), wybór zapisany w przeglądarce.
- **Dopracowany design**, aby praca była łatwiejsza i przyjemniejsza: panel boczny z drzewem i szczegóły obok (widok dwukolumnowy zamiast przechodzenia między stronami), ikony według typu pliku, przeciąganie pliku na całą stronę, lepszy widok na telefonie.
- **Dashboard** ze statystykami wczytanego drzewa: największe pliki i foldery, rozkład rozmiaru według typu pliku (wykres), liczba plików na poziomie zagnieżdżenia, puste foldery.
- **Wyszukiwanie rozmyte** i tryb filtrowania drzewa (pokazanie tylko gałęzi z wynikami).

### Bezpieczeństwo

- **Limit rozmiaru pliku** i liczby węzłów przed parsowaniem, z czytelnym komunikatem.
- **Nagłówki HTTP** na serwerze: Content Security Policy, `X-Content-Type-Options`, `Referrer-Policy`.
- **Automatyczny audyt zależności** w CI (`npm audit`, Dependabot).
- **Migracja na React Router v7**, gdy wymaganie v6 przestanie obowiązywać. Usuwa to obie znane podatności.

### Backend z bazą danych i AWS

Teraz dane są tylko w przeglądarce. Backend umożliwiłby pracę na wielu urządzeniach i udostępnianie drzew innym osobom.

- **Logowanie i konta użytkowników**, np. AWS Cognito albo OAuth (GitHub, Google). Każdy użytkownik widzi tylko swoje pliki.
- **Zarządzanie plikami JSON:** lista zapisanych drzew, dodawanie, zmiana nazwy, usuwanie, historia wersji i udostępnianie linkiem.
- **Pliki JSON w Amazon S3, a w bazie danych tylko metadane** (właściciel, nazwa, rozmiar, data, liczba węzłów, klucz pliku w S3). Duże pliki nie obciążają bazy danych ani pamięci przeglądarki. Upload i pobieranie przez krótkoterminowe linki S3 (presigned URL), więc plik nie przechodzi przez serwer API.
- **API** (np. Node.js z NestJS albo Fastify) z bazą PostgreSQL (Amazon RDS) i walidacją JSON po stronie serwera.
- **Przetwarzanie dużych plików na serwerze:** budowanie indeksu i wyszukiwanie po stronie API, a w przeglądarce tylko widoczna część drzewa (stronicowanie, ładowanie folderu przy rozwinięciu).

### Wydajność

- **Web Worker** do parsowania i indeksowania, aby interfejs nie zatrzymywał się przy dużych plikach.
- **IndexedDB zamiast `localStorage`**, aby duże drzewa przetrwały odświeżenie strony (gdy nie ma backendu).

### Testy i infrastruktura

- **Testy E2E (Playwright)** w prawdziwej przeglądarce: pełny przepływ (wklejenie JSON → drzewo → szczegóły), odświeżenie strony z wynikami wyszukiwania, deep link, klawiatura, duże drzewo oraz test dostępności `@axe-core/playwright`.
- **Testy wizualne** (zrzuty ekranu) i sprawdzenie na urządzeniach mobilnych.
- **Docker:** wieloetapowy `Dockerfile` (build w Node, serwowanie przez nginx z `try_files $uri /index.html`, aby deep linki nie dawały 404) i `docker-compose.yml` (frontend, API, baza danych). W CI: budowanie obrazu i testy E2E na kontenerze.
- **Wdrożenie na AWS:** frontend w S3 + CloudFront, API w ECS albo Lambda, infrastruktura jako kod (Terraform albo AWS CDK), automatyczne wdrożenie z GitHub Actions.
