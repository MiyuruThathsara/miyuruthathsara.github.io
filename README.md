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

- `index.md`: profile, research, publications, experience, education, review experience, and contact information. The CV builder reads these entries directly from the rendered page.
- `_config.yml`: site metadata and profile links.
- `_layouts/default.html`: page structure, navigation, and search/social metadata.
- `assets/css/style.css`: responsive styles and print layout.
- `assets/img/`: publication figures.
- `_data/cv.yml`: the company CV summary and technical expertise list.
- `_includes/profile-tools.html`: CV options and the image viewer.
- `assets/js/cv.js`: presets, individual entry selection, preview, and saved preferences.
- `assets/js/cv-pdf.js`: formal A4 PDF layout and pagination.
- `assets/js/images.js`: image enlargement and zoom controls.
- `assets/css/tools.css`: image viewer and CV builder layouts.

The GitHub Pages address is the canonical URL. The separate personal website, [miyuruthathsara.com](https://miyuruthathsara.com), is linked from the profile, contact section, and footer.

## Downloading a CV

Choose **Download CV** near the introduction, select Company or Academia, and adjust the sections, individual entries, contact details, and level of detail. The preview reflects the selection. **Download PDF** creates a text-based A4 document with page numbers; **Open PDF** provides a fallback for saving or sharing on mobile.

The CV name and headline are centered, followed by centered horizontal rows of email addresses and short, clickable website/profile labels. Rows wrap when needed. For a paper copy, turn off **Include hyperlinks (digital CV)** under Contact details: selected emails remain as plain text, website/profile links are omitted, and publication titles lose their clickable links without removing publication content. Individual contact choices are preserved when links are turned back on. This option is remembered alongside the other settings; resetting or changing the purpose restores the digital preset.

Presets change the section order and emphasis. Company uses the summary in `_data/cv.yml`; Academia uses the profile introduction. An acknowledged research contribution is kept separate from authored publications. Settings are saved in this browser's local storage; no personal selections are sent to a server. PDF creation happens in the browser, using a locally hosted copy of jsPDF 4.2.1 (MIT licence in `assets/vendor/jspdf-LICENSE.txt`). After updating the pinned package, run `npm run vendor:pdf` to refresh that copy.

The Google photograph is preserved. Publication images have lossless WebP alternatives and original PNG fallbacks. The viewer offers zoom and access to the original files, plus the vector PDF for the ISCAS diagram. To update a figure, replace its original and regenerate its matching WebP with `cwebp -lossless -m 6`.

## Verification

With Node.js 22.13 or later and Chrome installed, run:

```sh
npm ci
bundle exec jekyll build
npm test
```

The test starts a temporary server for `_site`, checks desktop and mobile layouts and accessibility, exercises the image viewer and CV options, and inspects the downloaded PDFs for selected content, excluded content, centered headers, hyperlink annotations, print-friendly output, and page bounds. Set `SITE_DIR` to test a different build directory. Set `BROWSER=webkit` after `npx playwright install webkit` to check WebKit as well. Screenshots and sample PDFs are saved in a temporary directory printed by the test.
