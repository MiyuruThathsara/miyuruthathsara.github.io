---
title: Miyuru Thathsara
layout: default
permalink: /
---

<!-- SEO + Structured Data (works even for one-page sites) -->
<meta name="description" content="PhD candidate at NTU, Singapore working on FPGA-accelerated, energy-efficient Stereo Visual SLAM and RISC-V hardware/software co-design for edge robotics." />

<!-- Optional but nice for social previews -->
<meta property="og:title" content="Miyuru Thathsara | FPGA-Accelerated Stereo Visual SLAM (NTU)" />
<meta property="og:description" content="FPGA-accelerated Stereo Visual SLAM, feature extraction, stereo matching, and hardware/software co-design for edge robotics." />
<meta property="og:type" content="website" />
<meta property="og:url" content="https://MiyuruThathsara.github.io/" />

<!-- Structured data: helps Google understand your identity -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Miyuru Thathsara",
  "url": "https://MiyuruThathsara.github.io/",
  "jobTitle": "PhD Candidate",
  "affiliation": {
    "@type": "Organization",
    "name": "Nanyang Technological University"
  },
  "sameAs": [
    "https://github.com/MiyuruThathsara",
    "https://lk.linkedin.com/in/miyuru-thathsara-07596518b",
    "https://scholar.google.com/citations?user=_F2z9wYAAAAJ&hl=en"
  ]
}
</script>

<style>
  .two-col { display: flex; gap: 2rem; align-items: flex-start; }
  .left-col { flex: 1; max-width: 280px; }
  .right-col { flex: 3; min-width: 0; }

  .profile-pic {
    width: 100%;
    max-width: 240px;
    border-radius: 14px;
    display: block;
    margin: 0 auto 1rem auto; /* center image */
  }

  .profile-overview {
    font-size: 0.90rem;
    line-height: 1.5;
  }

  /* Keep general body text left */
  .right-col { text-align: left; }

  /* Center headings only (## -> h2) */
  .right-col > h2 { text-align: center; }
  .left-col h2 { text-align: center; }

  /* Center Overview paragraph */
  .left-col .profile-overview { text-align: center; }

  /* Center "Current: Research Focus" heading + its paragraph */
  .right-col > h2:first-of-type { text-align: center; }
  .right-col > h2:first-of-type + p { text-align: center; }

  /* Mobile */
  @media (max-width: 900px) {
    .two-col { flex-direction: column; }
    .left-col { max-width: 100%; }
    .profile-pic { max-width: 220px; }
  }

  /* Widen the overall page container (theme override) */
  .wrapper, .container, .main-content, .page-content, .markdown-body, article, main, #main_content {
    max-width: 1400px !important;
    width: 95% !important;
    margin-left: auto !important;
    margin-right: auto !important;
  }

  /* Research Interests: 2-column clean grid (no bullets) */
  .ri-grid{
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem 1rem;
    padding-left: 0;
    list-style: none;
    margin: 0.6rem 0 0 0;
  }

  .ri-grid li{
    text-align: center;
    padding: 0.55rem 0.7rem;
    border: 1px solid rgba(0,0,0,0.12);
    border-radius: 12px;
    background: rgba(0,0,0,0.03);
  }

  @media (prefers-color-scheme: dark){
    .ri-grid li{
      border-color: rgba(255,255,255,0.18);
      background: rgba(255,255,255,0.06);
    }
  }

  @media (max-width: 900px){
    .ri-grid{ grid-template-columns: 1fr; }
  }

  /* Publications: media on the LEFT, text on the RIGHT */
  .pub {
    display: grid;
    grid-template-columns: minmax(240px, 320px) 1fr;
    gap: 1rem 1.25rem;
    align-items: center;
    margin: 1.25rem 0;
    padding: 0.9rem 1rem;
    border: 1px solid rgba(0,0,0,0.10);
    border-radius: 14px;
    background: rgba(0,0,0,0.02);
  }

  .pub-media {
    width: 100%;
  }

  .pub-vid {
    position: relative;
    padding-bottom: 56.25%;
    height: 0;
    overflow: hidden;
    border-radius: 12px;
  }
  .pub-vid iframe {
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    border: 0;
  }

  .pub-img {
    width: 100%;
    border-radius: 12px;
    display: block;
  }

  .pub-title {
    margin: 0 0 0.35rem 0;
    font-weight: 700;
  }
  .pub-meta {
    margin: 0 0 0.65rem 0;
    opacity: 0.9;
  }

  /* Bullets with minimal indent (only inside publications) */
  .pub-points{
    margin: 0.35rem 0 0 0 !important;   /* no extra left margin */
    padding-left: 0.95rem !important;   /* minimal indent for bullets */
    list-style-position: outside;       /* bullet sits outside text block */
  }

  .pub-points li{
    margin: 0.25rem 0;
  }

  @media (prefers-color-scheme: dark){
      .pub {
        border-color: rgba(255,255,255,0.16);
        background: rgba(255,255,255,0.05);
      }
    }

    /* Mobile: stack media above text */
    @media (max-width: 900px){
      .pub { grid-template-columns: 1fr; }
    }

    /* Desktop: show sidebar blocks, hide mobile footer */
  .sidebar-only { display: block; }
  .mobile-only  { display: none; }

  /* Mobile: hide sidebar blocks, show mobile footer at end */
  @media (max-width: 900px){
    .sidebar-only { display: none; }
    .mobile-only  { display: block; }

    .mobile-only { margin-top: 1.5rem; text-align: center; }
    .mobile-only h2 { text-align: center; }

    /* Center list items */
    .mobile-only ul{
      list-style: none;
      padding-left: 0;
      margin: 0.5rem auto 1rem auto;
      display: inline-block;   /* keeps the list centered as a block */
      text-align: center;        /* keeps lines readable; change to center if you want */
    }

    .mobile-only li{ margin: 0.35rem 0; }
  }

</style>

<div class="two-col">

<div class="left-col" markdown="1">
<img class="profile-pic" src="me.jpeg" alt="Miyuru Thathsara" />

<h2>Overview</h2>

<div class="profile-overview">
  <p>As a PhD Researcher at NTU, Singapore, I develop real-time, resource-efficient Visual SLAM systems by combining algorithm design with FPGA-based acceleration on embedded platforms. My research has produced top-tier first-author publications on stereo visual SLAM, feature matching, and hardware-efficient keypoint selection, with demonstrated improvements in latency and energy efficiency. I’m motivated by building systems that are both scientifically solid and practical to deploy.</p>
</div>

<div class="sidebar-only">
  <h2>Activities &amp; Hobbies</h2>

  <div class="profile-overview">
    <ul style="list-style: none; padding-left: 0; margin: 0.5rem 0 1rem 0;">
      <li>Badminton, cricket, and chess</li>
      <li>Enjoy sharing knowledge with the research community</li>
    </ul>
  </div>

  <h2>Contact</h2>

  <div class="profile-overview">
    <ul style="list-style: none; padding-left: 0; margin: 0.5rem 0 0 0;">
      <li>Personal Email: <a href="mailto:mthathsara@outlook.com">mthathsara@outlook.com</a></li>
      <li>Work Email: <a href="mailto:miyuruth001@e.ntu.edu.sg">miyuruth001@e.ntu.edu.sg</a></li>
      <li>Google Scholar: <a href="https://scholar.google.com/citations?user=_F2z9wYAAAAJ&amp;hl=en">Miyuru Thathsara</a></li>
      <li>LinkedIn: <a href="https://lk.linkedin.com/in/miyuru-thathsara-07596518b">Miyuru Thathsara</a></li>
      <li>GitHub: <a href="https://github.com/MiyuruThathsara">MiyuruThathsara</a></li>
    </ul>
  </div>
</div>

</div>

<div class="right-col" markdown="1">

## Current: Research Focus

Algorithm–architecture co-design for real-time stereo visual SLAM on FPGA SoCs, with emphasis on efficient salient keypoint extraction, descriptor matching, keypoint/keyframe selection, and system-level optimization under tight power constraints.

## Research Interests
<ul class="ri-grid">
  <li>Computer architecture</li>
  <li>Low-power edge AI systems</li>
  <li>Domain-specific accelerators (DSA)</li>
  <li>RISC-V co-processors</li>
  <li>Hardware/software co-design</li>
  <li>Adaptive / reconfigurable hardware</li>
</ul>

---

## Selected Publications

<div class="pub">
  <div class="pub-media">
    <div class="pub-vid">
      <iframe
        src="https://www.youtube.com/embed/vtGebB7Yoc8?autoplay=1&mute=1&loop=1&playlist=vtGebB7Yoc8&controls=1&rel=0&modestbranding=1"
        title="FPGA Stereo Visual SLAM Demo"
        allow="autoplay; encrypted-media; picture-in-picture"
        allowfullscreen>
      </iframe>
    </div>
  </div>
  <div class="pub-text">
    <p class="pub-title">FPGA Stereo Visual SLAM with Efficient Stereo Feature Matching and Key-frame Generation</p>
    <p class="pub-meta"><em>(FPL 2025 — First Author) • Accepted</em></p>
    <ul class="pub-points">
      <li>First FPGA SoC implementation of stereo visual SLAM</li>
      <li>Reduced stereo matching latency via <strong>region-aware + similarity-based descriptor grouping</strong></li>
      <li>Proposed <strong>tracking-status-based keyframe generation</strong> to avoid unnecessary map expansion and improve stability</li>
      <li>Validated on benchmarks + real-world experiments</li>
    </ul>
  </div>
</div>

<div class="pub">
  <div class="pub-media">
    <!-- Replace this placeholder with your own image file, e.g., assets/img/fpt24.png -->
    <img class="pub-img" src="assets/img/fpt24.png" alt="FPT 2024 paper diagram/teaser" />
  </div>
  <div class="pub-text">
    <p class="pub-title">Hardware-Efficient Homogenized Key-Point Selection for Visual SLAM</p>
    <p class="pub-meta"><em>(FPT 2024 — First Author • Technology Disclosure)</em> • <a href="https://ieeexplore.ieee.org/abstract/document/11113393">Paper</a></p>
    <ul class="pub-points">
      <li>Real-time FPGA accelerator for <strong>uniform keypoint selection</strong> in streaming video</li>
      <li>Grid-based streaming architecture + efficient neighbor sorting for dynamic input sizes</li>
      <li>Improves robustness and resource efficiency while meeting real-time constraints</li>
    </ul>
  </div>
</div>

<div class="pub">
  <div class="pub-media">
    <!-- Replace this placeholder with your own image file, e.g., assets/img/iscas24.png -->
    <img class="pub-img" src="assets/img/iscas24.png" alt="ISCAS 2024 paper diagram/teaser" />
  </div>
  <div class="pub-text">
    <p class="pub-title">Hardware Accelerator for Feature Matching with Binary Search Tree</p>
    <p class="pub-meta"><em>(ISCAS 2024 — First Author • Patent Pending)</em> • <a href="https://ieeexplore.ieee.org/document/10558431">Paper</a></p>
    <ul class="pub-points">
      <li>Stream-processing FPGA matcher using a <strong>balanced BST</strong> + <strong>ratio-test</strong> outlier rejection</li>
      <li>~<strong>12× faster</strong> than linear exhaustive search on FPGA</li>
      <li>Scalable, resource-efficient design</li>
    </ul>
  </div>
</div>

<div class="pub">
  <div class="pub-media">
    <!-- Replace this placeholder with your own image file, e.g., assets/img/fpl20.png -->
    <img class="pub-img" src="assets/img/fpl20.png" alt="FPL 2020 paper diagram/teaser" />
  </div>
  <div class="pub-text">
    <p class="pub-title">Dynamically Growing Neural Network Architecture for Lifelong Deep Learning on the Edge</p>
    <p class="pub-meta"><em>(FPL 2020 — Co-author 2nd)</em> • <a href="https://ieeexplore.ieee.org/document/9221575">Paper</a></p>
    <ul class="pub-points">
      <li>FPGA architecture for lifelong learning with efficient scheduling/resource reuse</li>
      <li>Designed to meet tight edge constraints</li>
      <li>Reported strong results on Core50</li>
    </ul>
  </div>
</div>

<div class="pub">
  <div class="pub-media">
    <!-- Replace this placeholder with your own image file, e.g., assets/img/iciafs18.png -->
    <img class="pub-img" src="assets/img/iciafs18.png" alt="ICIAfS 2018 paper diagram/teaser" />
  </div>
  <div class="pub-text">
    <p class="pub-title">Feasibility Study of a Novel Cross Assembled Multi-quadrotor UAV</p>
    <p class="pub-meta"><em>(ICIAfS 2018 — Acknowledged)</em> • <a href="https://ieeexplore.ieee.org/document/8913338">Paper</a></p>
    <ul class="pub-points">
      <li>Proof-of-concept prototype and stabilization validation</li>
      <li>Demonstrated control reuse from single-quadrotor design with minimal changes</li>
      <li>Plug-and-play replacement concept for improved robustness</li>
    </ul>
  </div>
</div>

---

## Experience
**Project Officer (Research)**, HESL, SCSE, NTU Singapore *(Jul 2022 – Jan 2023)*<br>
&nbsp;&nbsp;Designed and developed a visual SLAM algorithm on FPGA SoC (system prototyping and acceleration)<br>
**Engineer, Accelerated Systems (HWAC Team)**, LSEG Technologies Sri Lanka *(May 2021 – Aug 2022)*<br>
&nbsp;&nbsp;Developed a **customized multi-channel AXI DMA engine**, later integrated with LSEG market data disemmination pipeline<br>
&nbsp;&nbsp;Worked on **partial reconfiguration support** for hardware acceleration workflows<br>
**Research Assistant**, HESL, SCSE, NTU Singapore *(Jul 2019 – Dec 2019)*<br>
&nbsp;&nbsp;Developed **streaming hardware architectures** for deep learning and a self-organization map classifiers<br>
**Research Assistant**, UAV Lab, University of Moratuwa *(Jan 2018 – Dec 2018)*<br>
&nbsp;&nbsp;Designed and developed a multi-rotor controller hexacopter platform

---

## Education
**PhD Candidate**, College of Computing and Data Science, Nanyang Technological University, Singapore *(2025 – Present)*<br>
**PhD Student**, College of Computing and Data Science, Nanyang Technological University, Singapore *(2023 – 2025)*<br>
**BSc (Hons) Electronics and Telecommunication Engineering (First Class)**, University of Moratuwa, Sri Lanka *(2016 – 2021)*<br>
&nbsp;&nbsp;GPA **3.74/4.2** • Key modules: Digital IC Design (A+), Advanced Digital Systems (A+)<br>
**Certificate Level in Management**, Achievers Lanka Business School *(2015 – 2016)*<br>
**High School: Nalanda College, Colombo** *(2002 – 2015)*<br>
&nbsp;&nbsp;Z-score **2.5017** (Island Rank **119**) • A grades: Combined Mathematics, Chemistry, Physics • 9 A’s (O/L)

---

## Awards & Achievements
**NTU Research Scholarship Awardee** — 2023 (4 years)<br>
**Dean’s List** — University of Moratuwa (Semesters 1, 2, 3, 6, 8)<br>
**Distinction** — 2014 Olympiad Mathematics Competition<br>
**Chess** — School team captain (2005–2010); All Island 25th (Individual) • Provincial 5th (Individual) • All Island 3rd (Team) ×2

<div class="mobile-only">
  <hr/>

  <h2>Activities &amp; Hobbies</h2>
  <ul>
    <li>Badminton, cricket, and chess</li>
    <li>Enjoy sharing knowledge with the research community</li>
  </ul>

  <h2>Contact</h2>
  <ul>
    <li>Personal Email: <a href="mailto:mthathsara@outlook.com">mthathsara@outlook.com</a></li>
    <li>Work Email: <a href="mailto:miyuruth001@e.ntu.edu.sg">miyuruth001@e.ntu.edu.sg</a></li>
    <li>Google Scholar: <a href="https://scholar.google.com/citations?user=_F2z9wYAAAAJ&amp;hl=en">Miyuru Thathsara</a></li>
    <li>LinkedIn: <a href="https://lk.linkedin.com/in/miyuru-thathsara-07596518b">Miyuru Thathsara</a></li>
    <li>GitHub: <a href="https://github.com/MiyuruThathsara">MiyuruThathsara</a></li>
  </ul>
</div>

</div>
</div>
