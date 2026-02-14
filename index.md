---
title: Miyuru Thathsara
layout: default
---


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
</style>

<div class="two-col">

<div class="left-col" markdown="1">
<img class="profile-pic" src="me.jpeg" alt="Miyuru Thathsara" />

<h2>Overview</h2>

<div class="profile-overview">
  <p>As a PhD Researcher at NTU, Singapore, I develop real-time, resource-efficient Visual SLAM systems by combining algorithm design with FPGA-based acceleration on embedded platforms. My research has produced top-tier first-author publications on stereo visual SLAM, feature matching, and hardware-efficient keypoint selection, with demonstrated improvements in latency and energy efficiency. I’m motivated by building systems that are both scientifically solid and practical to deploy.</p>
</div>

</div>

<div class="right-col" markdown="1">

## Current: Research Focus

Algorithm–architecture co-design for real-time stereo visual SLAM on FPGA SoCs, with emphasis on efficient salient feature extraction, descriptor matching, keypoint/keyframe selection, and system-level optimization under tight power constraints.

## Research Interests
- Embedded systems and FPGA-based acceleration  
- Reconfigurable hardware design for machine learning and SLAM  
- Hardware/software co-design  
- Algorithm development for efficient computing  

---

## Education
- **PhD Candidate**, College of Computing and Data Science, Nanyang Technological University, Singapore *(2025 – Present)*
- **PhD Student**, College of Computing and Data Science, Nanyang Technological University, Singapore *(2023 – 2025)*
- **BSc (Hons) Electronics and Telecommunication Engineering**, University of Moratuwa, Sri Lanka *(2016 – 2021)*  
  GPA **3.74/4.2** (First Class) • Key modules: Digital IC Design (A+), Advanced Digital Systems (A+)
- **Certificate Level in Management**, Achievers Lanka Business School *(2015 – 2016)*
- **Nalanda College, Colombo** *(2002 – 2015)*  
  Z-score **2.5017** (Island Rank **119**) • A grades: Combined Mathematics, Chemistry, Physics • 9 A’s (O/L)

---

## Experience
- **Project Officer (Research)**, HESL, SCSE, NTU Singapore *(Jul 2022 – Jan 2023)*
  - Implemented a SLAM algorithm on FPGA (system prototyping and acceleration)
- **Engineer, Accelerated Systems (HWAC Team)**, LSEG Technologies Sri Lanka *(May 2021 – Aug 2022)*
  - Developed a **custom AXI DMA engine**
  - Worked on **partial reconfiguration support** for hardware acceleration workflows
- **Research Assistant**, HESL, SCSE, NTU Singapore *(Jul 2019 – Dec 2019)*
  - Designed **streaming hardware architectures** for deep learning and a self-organization map classifier
- **Research Assistant**, UAV Lab, University of Moratuwa *(Jan 2018)*
  - Built a PWM resolver (Arduino Mega) for a multi-rotor platform

---

## Selected Publications
- **FPGA Stereo Visual SLAM with Efficient Stereo Feature Matching and Key-frame Generation** *(FPL 2025) — First Author*
  - First FPGA SoC implementation of stereo visual SLAM  
  - Reduced stereo matching latency via **region-aware + similarity-based descriptor grouping**  
  - Proposed **tracking-status-based keyframe generation** to avoid unnecessary map expansion and improve stability  
  - Validated on benchmarks + real-world experiments • *[Accepted]*
  <!-- Demo video (autoplays muted) -->
  <div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;margin:0.75rem 0 1.5rem 0;">
    <iframe
      src="https://www.youtube.com/embed/vtGebB7Yoc8?autoplay=1&mute=1&loop=1&playlist=vtGebB7Yoc8&controls=1&rel=0&modestbranding=1"
      title="FPGA Stereo Visual SLAM Demo"
      frameborder="0"
      allow="autoplay; encrypted-media; picture-in-picture"
      allowfullscreen
      style="position:absolute;top:0;left:0;width:100%;height:100%;">
    </iframe>
  </div>


- **Hardware-Efficient Homogenized Key-Point Selection for Visual SLAM** *(FPT 2024) — First Author* *(Technology Disclosure)*
  - Real-time FPGA accelerator for **uniform keypoint selection** in streaming video  
  - Grid-based streaming architecture + efficient neighbor sorting for dynamic input sizes  
  - Improves robustness and resource efficiency while meeting real-time constraints  
  - [IEEE Xplore](https://ieeexplore.ieee.org/abstract/document/11113393)

- **Hardware Accelerator for Feature Matching with Binary Search Tree** *(ISCAS 2024) — First Author* *(Patent Pending)*
  - Stream-processing FPGA feature matcher using a **balanced BST** + **ratio-test** outlier rejection  
  - ~**12× faster** than linear exhaustive search on FPGA, with scalable and resource-efficient design  
  - [IEEE Xplore](https://ieeexplore.ieee.org/document/10558431)

- **Dynamically Growing Neural Network Architecture for Lifelong Deep Learning on the Edge** *(FPL 2020) — Co-author (2nd)*
  - FPGA architecture for self-organization neural networks enabling class-incremental lifelong learning on edge devices  
  - Efficient scheduling/resource reuse + approximate computing for tight constraints  
  - Strong results on Core50; outperforms CPU/GPU baselines in the study  
  - [IEEE Xplore](https://ieeexplore.ieee.org/document/9221575)

- **Feasibility Study of a Novel Cross Assembled Multi-quadrotor UAV** *(ICIAfS 2018) — Acknowledged*
  - Proof-of-concept prototype for cross-assembled multi-quadrotor design  
  - Demonstrated stabilization using a controller designed for single quadrotors (with minimal modifications)  
  - [IEEE Xplore](https://ieeexplore.ieee.org/document/8913338)

---

## Awards & Achievements
- **NTU Research Scholarship Awardee** (2023, 4 years)
- **Dean’s List**, University of Moratuwa (Semesters 1, 2, 3, 6, 8)
- Distinction, 2014 Olympiad Mathematics Competition
- Chess: School team captain (2005–2010) with national-level placements  
  - All Island 25th (Individual) • Provincial 5th (Individual) • All Island 3rd (Team) ×2

---

## Activities & Hobbies
- Badminton, cricket, and chess  
- Enjoy sharing knowledge with the research community  

---

## Contact
- Personal Email: [mthathsara@outlook.com](mailto:mthathsara@outlook.com)
- Work Email: [miyuruth001@e.ntu.edu.sg](mailto:miyuruth001@e.ntu.edu.sg)
- Google Scholar: [Miyuru Thathsara] (https://scholar.google.com/citations?user=_F2z9wYAAAAJ&hl=en)
- LinkedIn: [Miyuru Thathsara](https://lk.linkedin.com/in/miyuru-thathsara-07596518b)
- GitHub: [MiyuruThathsara](https://github.com/MiyuruThathsara)

</div>
</div>
