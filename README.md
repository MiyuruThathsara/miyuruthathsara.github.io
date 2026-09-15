# Miyuru Thathsara — Personal Profile

A responsive profile and research website built with Jekyll and hosted on GitHub Pages.

## Local preview

With Ruby 3.3 or later and Bundler installed:

```sh
bundle install
bundle exec jekyll serve
```

Open `http://localhost:4000`. To build without starting a server, run `bundle exec jekyll build`.

## Editing

- `index.md`: homepage, with a single affiliation beneath the name and a static, uncropped portrait.
- `news.html`, `research.html`, `publications.html`, `experience.html`, `education.html`, `contact.html`: separate pages for the navigation tabs. Review experience is on Publications; honours and awards are on Education. `review.html` redirects old links to `/publications/#review`.
- `_data/navigation.yml`: page labels, URLs, and active-navigation identifiers.
- `_data/profile.json`: shared profile, research, employment, education, review, awards, and personal-interest content used by both pages and CV generation.
- `_data/publications.json`: shared publication metadata, plain-language website summaries, and figure references.
- `_config.yml`: site metadata and profile links.
- `_layouts/default.html`: page structure, navigation, and search/social metadata.
- `_layouts/section.html`: shared heading for individual pages. The single CV button lives in the global header in `_layouts/default.html`.
- `assets/css/style.css`: responsive styles and print layout.
- `assets/img/`: publication figures.
- `_data/cv.yml`: CV-only professional/academic summaries, research focus, technical expertise, and formal publication descriptions. Publication keys match the IDs in `_data/publications.json`.
- `_data/news.yml`: website-only news, newest first, with confirmed years/dates and links to the relevant sections. News is deliberately excluded from CV options and PDF generation.
- `_includes/profile-tools.html`: CV options and the image viewer.
- `_includes/theme-control.html`: compact theme disclosure with native radio options.
- `_includes/cv-data.html`: embeds the full shared CV data into every page, without fetching or scraping other pages. News is not included.
- `assets/js/cv.js`: presets, individual entry selection, preview, and saved preferences.
- `assets/js/cv-pdf.js`: formal A4 PDF layout and pagination.
- `assets/js/images.js`: image enlargement and zoom controls.
- `assets/js/navigation.js`: redirects old homepage section bookmarks (such as `/#research`) to their new pages.
- `assets/js/theme.js`: applies the colour preference before styles load and keeps the shared theme selector in sync.
- `assets/css/tools.css`: image viewer and CV builder layouts.

The GitHub Pages address is the canonical URL. The separate personal website, [miyuruthathsara.com](https://miyuruthathsara.com), is linked from the profile, contact section, and footer.

## Colour theme

The header has an aligned CV/document control and a theme icon. The CV label is shown on wide screens; compact screens use the labelled icon with a tooltip. On smaller screens, branding and controls share the first row and centered navigation sits below. Both controls have at least 44-pixel touch targets.

The theme icon opens **System**, **Light**, and **Dark** options, with the selected setting represented by a monitor, sun, or moon. The menu supports keyboard navigation, Escape, and dismissal by clicking outside. System is the default and follows the browser/device colour preference, including changes while the site is open. Manual choices are saved locally as `miyuru-theme-v1`, persist across pages and visits, and synchronize between open tabs. With storage blocked, theme selection still works on the current page. With JavaScript disabled, the site follows the device setting without showing an inactive selector. Diagrams keep their original colours, and CV previews, downloaded PDFs, and printed pages remain light and print-friendly.

## Downloading a CV

Choose the **CV PDF** document icon in the shared top header (accessible name: **Generate CV PDF**), select Company or Academia, and adjust the sections, individual entries, contact details, and level of detail. There are no duplicate page-level CV buttons. The Selections and Content preview panels scroll independently, side by side on desktop and stacked on mobile, while the close/download controls stay in place. Both panels can be focused and scrolled with the keyboard. The CV always uses the complete shared profile, regardless of which page opened the generator. **Download PDF** creates a text-based A4 document with page numbers; **Open PDF** provides a fallback for saving or sharing on mobile.

Selected coursework and Chess achievements are collapsed by default on Education, with visible disclosure labels that visitors can expand or collapse without JavaScript. Coursework is stored on its degree record as `coursework`; awards marked `collapsed` are rendered as disclosures. Both remain available in CV generation but are off in fresh presets: enable **Selected coursework** under Level of detail, or **Chess** under Honours and awards → Choose entries. Grades independently controls GPA, school grades, and course grades without removing selected course names. Explicit choices are remembered across pages; expanding website details does not change CV selections. Review experience remains an optional academic-service section in the CV, separate from authored publications.

The CV name and headline are centered, followed by centered horizontal rows of email addresses and short, clickable website/profile labels. Rows wrap when needed. For a paper copy, turn off **Include hyperlinks (digital CV)** under Contact details: selected emails remain as plain text, website/profile links are omitted, and publication titles lose their clickable links without removing publication content. Individual contact choices are preserved when links are turned back on. This option is remembered alongside the other settings; resetting or changing the purpose restores the digital preset.

Presets change the section order and emphasis. Each purpose uses its own formal summary from `_data/cv.yml`. Website paper descriptions use plain language; the CV uses the separate technical descriptions in that data file, without changing publication titles, venues, authorship status, or links. An acknowledged research contribution is kept separate from authored publications. The PDF uses a restrained, single-column Helvetica layout, right-aligned dates, numbered publications, concise award entries, and bullet-point role descriptions. Standard entries are kept together at page breaks.

Settings are saved in this browser's local storage; no personal selections are sent to a server. PDF creation happens in the browser, using a locally hosted copy of jsPDF 4.2.1 (MIT licence in `assets/vendor/jspdf-LICENSE.txt`). After updating the pinned package, run `npm run vendor:pdf` to refresh that copy.

The Google photograph is preserved and displayed without an enlargement link. Publication images have lossless WebP alternatives and original PNG fallbacks. Their viewer offers zoom and access to the original files, plus the vector PDF for the ISCAS diagram. To update a figure, replace its original and regenerate its matching WebP with `cwebp -lossless -m 6`.

## Verification

With Node.js 22.13 or later and Chrome installed, run:

```sh
npm ci
bundle exec jekyll build
npm test
```

The test starts a temporary server for `_site`, checks every page's navigation, direct reload, canonical URL, desktop/mobile layout, and accessibility, and confirms complete, identical CV content from all pages. Theme checks cover toolbar alignment, touch targets, icon labels, both palettes, live system changes, cross-page and cross-tab persistence, disabled storage/JavaScript, invalid saved settings, and light print/PDF output. Coursework and Chess disclosures are checked for expansion and collapse, and their CV choices for preset exclusion, explicit inclusion, grades, and persistence. It also exercises independent panel scrolling, keyboard controls, the image viewer, and download retry. Downloaded PDFs are checked for selected content, excluded News and web summaries, formal publication wording, aligned dates, typography, centered headers, hyperlink annotations, print-friendly output, and page bounds. Set `SITE_DIR` to test a different build directory. Set `BROWSER=webkit` after `npx playwright install webkit` to check WebKit as well. Screenshots and sample PDFs are saved in a temporary directory printed by the test.
