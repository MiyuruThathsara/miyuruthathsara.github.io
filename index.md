---
title: Miyuru Thathsara
layout: default
permalink: /
---

<div class="profile-layout">
  <header class="profile-heading">
    <p class="eyebrow">Embedded Intelligence <span aria-hidden="true">|</span> Hardware Acceleration</p>
    <h1 id="profile-title">Miyuru Thathsara</h1>
    <p class="intro-subtitle">Ph.D. Candidate at Nanyang Technological University</p>
  </header>
  <aside class="profile-sidebar" aria-label="Profile and links">
    <a class="profile-photo-link" href="{{ '/me.jpeg' | relative_url }}" data-image-viewer data-image-title="Miyuru Thathsara" aria-label="View full photograph of Miyuru Thathsara">
      <span class="profile-photo-frame"><img class="profile-photo" src="{{ '/me.jpeg' | relative_url }}" alt="Miyuru Thathsara beside the Google sign" width="800" height="800" fetchpriority="high"></span>
      <span class="image-caption">View full photograph <span aria-hidden="true">↗</span></span>
    </a>
    <div class="profile-affiliation">
      <p class="sidebar-label">Ph.D. Candidate</p>
      <p>College of Computing<br>and Data Science</p>
      <p>Nanyang Technological University<br><span class="muted">Singapore</span></p>
    </div>
    <div class="profile-links">
      <a href="{{ site.scholar_url | escape }}">Google Scholar <span aria-hidden="true">↗</span></a>
      <a href="{{ site.linkedin_url }}">LinkedIn <span aria-hidden="true">↗</span></a>
      <a href="{{ site.github_url }}">GitHub <span aria-hidden="true">↗</span></a>
    </div>
    <div class="sidebar-website">
      <p class="sidebar-label">Personal website</p>
      <a href="{{ site.personal_website }}">miyuruthathsara.com <span aria-hidden="true">↗</span></a>
    </div>
  </aside>

  <div class="profile-content">
    <section class="introduction" aria-labelledby="profile-title">
      <p>I develop efficient onboard computing to help robots understand their surroundings and find their way. My work combines camera-based vision with hardware acceleration so that small robots can process information and respond in real time, within limited power and computing budgets.</p>
      <p>My long-term goal is collaborative autonomy: teams of robots that share what they observe, build a common understanding of their environment, and coordinate useful work. I focus on the intelligence within each robot that makes this possible.</p>
      <div class="profile-actions">
        <button class="button" type="button" data-open-cv hidden>Download CV <span class="button-format">PDF</span></button>
        <a class="text-link" href="#contact">Contact me <span aria-hidden="true">↗</span></a>
      </div>
      <noscript><p class="section-note">Enable JavaScript to customize and download a PDF CV.</p></noscript>
    </section>

    <section class="content-section news-section" id="news" aria-labelledby="news-title">
      <div class="section-heading">
        <h2 id="news-title">News</h2>
        <span class="section-index" aria-hidden="true">Latest updates</span>
      </div>
      <ol class="news-list">
        {% for update in site.data.news %}
        <li>
          <time datetime="{{ update.date | escape }}">{{ update.date | escape }}</time>
          <div>
            <h3>{{ update.title | escape }}</h3>
            <p>{{ update.summary | escape }} <a href="{{ update.link | escape }}">{{ update.link_label | escape }} <span aria-hidden="true">↗</span></a></p>
          </div>
        </li>
        {% endfor %}
      </ol>
    </section>

    <section class="content-section" id="research" aria-labelledby="research-title">
      <div class="section-heading">
        <h2 id="research-title">Research</h2>
        <span class="section-index" aria-hidden="true">01</span>
      </div>
      <div class="research-focus">
        <h3>Current focus</h3>
        <p>My current research helps a robot estimate its position and build a map using cameras, a process known as visual simultaneous localization and mapping (SLAM). I design the algorithms and the computing hardware together, using reconfigurable chips called FPGAs to make demanding vision tasks faster and more energy efficient.</p>
        <p>This work provides a foundation for robots that can share spatial information and act together. I aim to support practical applications such as precision agriculture, infrastructure inspection, and environmental monitoring.</p>
      </div>
      <div class="research-themes">
        <div class="research-theme">
          <h3>Visual understanding</h3>
          <p>Using camera images to recognize landmarks, track movement, and build a map of the surroundings.</p>
        </div>
        <div class="research-theme">
          <h3>Efficient onboard computing</h3>
          <p>Combining software and tailored hardware to process sensor data quickly while using less energy.</p>
        </div>
        <div class="research-theme">
          <h3>Collaborative autonomy</h3>
          <p>Working toward teams of robots that share useful observations, align their maps, and coordinate their actions.</p>
        </div>
      </div>
    </section>

    <section class="content-section" id="publications" aria-labelledby="publications-title">
      <div class="section-heading">
        <h2 id="publications-title">Selected publications</h2>
        <span class="section-index" aria-hidden="true">02</span>
      </div>
      <p class="section-note">Research in reconfigurable computing and embedded systems. <a href="{{ site.scholar_url | escape }}">View Google Scholar <span aria-hidden="true">↗</span></a></p>

      <article class="publication publication-featured" data-cv-id="fpl2025">
        <p class="publication-venue">FPL 2025 <span>First author · Accepted</span></p>
        <h3>FPGA Stereo Visual SLAM with Efficient Stereo Feature Matching and Key-frame Generation</h3>
        <p>Helps a robot use two cameras to track its movement and build a map. Custom FPGA hardware matches image features faster, while selective map updates help keep tracking stable.</p>
        <details class="demo-disclosure">
          <summary>View research demonstration</summary>
          <div class="video-frame">
            <iframe src="https://www.youtube-nocookie.com/embed/vtGebB7Yoc8?rel=0" title="FPGA stereo visual SLAM research demonstration" loading="lazy" allow="encrypted-media; picture-in-picture" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
          </div>
          <p class="video-fallback"><a href="https://www.youtube.com/watch?v=vtGebB7Yoc8">Watch on YouTube <span aria-hidden="true">↗</span></a></p>
        </details>
      </article>

      <article class="publication" data-cv-id="fpt2024">
        <a class="publication-media" href="{{ '/assets/img/fpt24.png' | relative_url }}" data-image-viewer data-image-title="Hardware-efficient keypoint selection" aria-label="Enlarge the keypoint selection diagram">
          <picture><source srcset="{{ '/assets/img/fpt24.webp' | relative_url }}" type="image/webp"><img src="{{ '/assets/img/fpt24.png' | relative_url }}" alt="Keypoint selection results on visual SLAM image sequences" width="1809" height="1564" loading="lazy" decoding="async"></picture>
          <span class="image-caption">View full-size figure <span aria-hidden="true">↗</span></span>
        </a>
        <div>
          <p class="publication-venue">FPT 2024 <span>First author · Technology disclosure</span></p>
          <h3><a href="https://ieeexplore.ieee.org/abstract/document/11113393">Hardware-Efficient Homogenized Key-Point Selection for Visual SLAM</a></h3>
          <p>Selects useful visual landmarks evenly across an image so a robot can track its movement reliably. The FPGA design handles this task efficiently as the number of image features changes.</p>
          <a class="publication-link" href="https://ieeexplore.ieee.org/abstract/document/11113393" aria-label="Read Hardware-Efficient Homogenized Key-Point Selection for Visual SLAM on IEEE Xplore">Paper <span aria-hidden="true">↗</span></a>
        </div>
      </article>

      <article class="publication" data-cv-id="iscas2024">
        <a class="publication-media" href="{{ '/assets/img/iscas24.png' | relative_url }}" data-image-viewer data-image-title="Binary search tree feature matcher" data-vector-url="{{ '/assets/img/iscas24.pdf' | relative_url }}" aria-label="Enlarge the feature matching architecture diagram">
          <picture><source srcset="{{ '/assets/img/iscas24.webp' | relative_url }}" type="image/webp"><img src="{{ '/assets/img/iscas24.png' | relative_url }}" alt="Binary search tree architecture for accelerated feature matching" width="721" height="517" loading="lazy" decoding="async"></picture>
          <span class="image-caption">View full-size figure <span aria-hidden="true">↗</span></span>
        </a>
        <div>
          <p class="publication-venue">ISCAS 2024 <span>First author · Patent pending</span></p>
          <h3><a href="https://ieeexplore.ieee.org/document/10558431">Hardware Accelerator for Feature Matching with Binary Search Tree</a></h3>
          <p>Matches visual landmarks between images to help a robot track its movement. An organized search on FPGA makes matching about 12 times faster than checking every possible match on FPGA.</p>
          <a class="publication-link" href="https://ieeexplore.ieee.org/document/10558431" aria-label="Read Hardware Accelerator for Feature Matching with Binary Search Tree on IEEE Xplore">Paper <span aria-hidden="true">↗</span></a>
        </div>
      </article>

      <article class="publication" data-cv-id="fpl2020">
        <a class="publication-media" href="{{ '/assets/img/fpl20.png' | relative_url }}" data-image-viewer data-image-title="Lifelong learning architecture" aria-label="Enlarge the lifelong learning architecture diagram">
          <picture><source srcset="{{ '/assets/img/fpl20.webp' | relative_url }}" type="image/webp"><img src="{{ '/assets/img/fpl20.png' | relative_url }}" alt="Dynamically growing neural network architecture for lifelong learning" width="612" height="389" loading="lazy" decoding="async"></picture>
          <span class="image-caption">View full-size figure <span aria-hidden="true">↗</span></span>
        </a>
        <div>
          <p class="publication-venue">FPL 2020 <span>Second author</span></p>
          <h3><a href="https://ieeexplore.ieee.org/document/9221575">Dynamically Growing Neural Network Architecture for Lifelong Deep Learning on the Edge</a></h3>
          <p>Supports neural networks that learn new tasks over time on small, resource-limited devices. The FPGA design reuses computing resources to make this ongoing learning more efficient.</p>
          <a class="publication-link" href="https://ieeexplore.ieee.org/document/9221575" aria-label="Read Dynamically Growing Neural Network Architecture for Lifelong Deep Learning on the Edge on IEEE Xplore">Paper <span aria-hidden="true">↗</span></a>
        </div>
      </article>

      <h3 class="subheading contribution-heading">Additional research contribution</h3>
      <article class="publication publication-contribution" data-cv-id="iciafs2018">
        <a class="publication-media" href="{{ '/assets/img/iciafs18.png' | relative_url }}" data-image-viewer data-image-title="Cross-assembled multi-quadrotor UAV" aria-label="Enlarge the multi-quadrotor UAV photograph">
          <picture><source srcset="{{ '/assets/img/iciafs18.webp' | relative_url }}" type="image/webp"><img src="{{ '/assets/img/iciafs18.png' | relative_url }}" alt="Cross-assembled multi-quadrotor UAV prototype" width="656" height="371" loading="lazy" decoding="async"></picture>
          <span class="image-caption">View full-size figure <span aria-hidden="true">↗</span></span>
        </a>
        <div>
          <p class="publication-venue">ICIAfS 2018 <span>Acknowledged contributor</span></p>
          <h3><a href="https://ieeexplore.ieee.org/document/8913338">Feasibility Study of a Novel Cross Assembled Multi-quadrotor UAV</a></h3>
          <p>Contributed to building and testing a drone assembled from multiple quadrotor units. The study explored stable flight, reuse of existing flight controls, and replaceable modules.</p>
          <a class="publication-link" href="https://ieeexplore.ieee.org/document/8913338" aria-label="Read Feasibility Study of a Novel Cross Assembled Multi-quadrotor UAV on IEEE Xplore">Paper <span aria-hidden="true">↗</span></a>
        </div>
      </article>
    </section>

    <section class="content-section" id="experience" aria-labelledby="experience-title">
      <div class="section-heading">
        <h2 id="experience-title">Experience</h2>
        <span class="section-index" aria-hidden="true">03</span>
      </div>
      <div class="record">
        <p class="record-date">Jul 2022 – Jan 2023</p>
        <div>
          <h3>Project Officer (Research)</h3>
          <p class="record-organization">HESL, CCDS · Nanyang Technological University, Singapore</p>
          <p>Designed and developed a visual SLAM algorithm on an FPGA SoC, including system prototyping and hardware acceleration.</p>
        </div>
      </div>
      <div class="record">
        <p class="record-date">May 2021 – Aug 2022</p>
        <div>
          <h3>Engineer, Accelerated Systems</h3>
          <p class="record-organization">HWAC Team · LSEG Technologies, Sri Lanka</p>
          <p>Developed a customized multi-channel AXI DMA engine, subsequently integrated into the LSEG market data dissemination pipeline. Contributed partial reconfiguration support for hardware acceleration workflows.</p>
        </div>
      </div>
      <div class="record">
        <p class="record-date">Jul 2019 – Dec 2019</p>
        <div>
          <h3>Research Assistant</h3>
          <p class="record-organization">HESL, CCDS · Nanyang Technological University, Singapore</p>
          <p>Developed streaming hardware architectures for deep learning and self-organizing map classifiers.</p>
        </div>
      </div>
      <div class="record">
        <p class="record-date">Jan 2018 – Dec 2018</p>
        <div>
          <h3>Research Assistant</h3>
          <p class="record-organization">UAV Lab · University of Moratuwa, Sri Lanka</p>
          <p>Designed and developed a multirotor controller for a hexacopter platform.</p>
        </div>
      </div>
    </section>

    <section class="content-section" id="education" aria-labelledby="education-title">
      <div class="section-heading">
        <h2 id="education-title">Education</h2>
        <span class="section-index" aria-hidden="true">04</span>
      </div>
      <div class="record">
        <p class="record-date">2023 – Present</p>
        <div>
          <h3>Doctor of Philosophy <span class="degree-status">(in progress)</span></h3>
          <p class="record-organization">College of Computing and Data Science<br>Nanyang Technological University, Singapore</p>
          <p>Ph.D. student, 2023–2025; Ph.D. candidate since 2025.</p>
        </div>
      </div>
      <div class="record">
        <p class="record-date">2016 – 2021</p>
        <div>
          <h3>B.Sc. (Hons) in Electronics and Telecommunication Engineering</h3>
          <p class="record-organization">University of Moratuwa, Sri Lanka</p>
          <p>First Class Honours · GPA: 3.74/4.2</p>
          <p>Selected coursework: Digital IC Design (A+), Advanced Digital Systems (A+).</p>
        </div>
      </div>
      <details class="education-details">
        <summary>Earlier education</summary>
        <div class="record">
          <p class="record-date">2015 – 2016</p>
          <div>
            <h3>Certificate Level in Management</h3>
            <p class="record-organization">Achievers Lanka Business School</p>
          </div>
        </div>
        <div class="record">
          <p class="record-date">2002 – 2015</p>
          <div>
            <h3>Nalanda College, Colombo</h3>
            <p>A/L: A grades in Combined Mathematics, Chemistry, and Physics. Z-score: 2.5017; island rank: 119.</p>
            <p>O/L: nine A grades.</p>
          </div>
        </div>
      </details>
    </section>

    <section class="content-section" id="awards" aria-labelledby="awards-title">
      <div class="section-heading">
        <h2 id="awards-title">Honours &amp; awards</h2>
        <span class="section-index" aria-hidden="true">05</span>
      </div>
      <ul class="award-list">
        <li><strong>NTU Research Scholarship</strong><span>Awarded in 2023 · Four-year scholarship</span></li>
        <li><strong>Dean’s List, University of Moratuwa</strong><span>Semesters 1, 2, 3, 6, and 8</span></li>
        <li><strong>Olympiad Mathematics Competition</strong><span>Distinction · 2014</span></li>
        <li><strong>Chess</strong><span>School team captain, 2005–2010. Individual: 25th nationally and 5th provincially. Team: 3rd nationally on two occasions.</span></li>
      </ul>
    </section>

    <section class="content-section" id="review" aria-labelledby="review-title">
      <div class="section-heading">
        <h2 id="review-title">Review Experience</h2>
        <span class="section-index" aria-hidden="true">06</span>
      </div>
      <div class="record">
        <p class="record-date">2026</p>
        <div>
          <h3>External Reviewer</h3>
          <p class="record-organization">ICCAD 2026</p>
        </div>
      </div>
    </section>

    <section class="content-section contact-section" id="contact" aria-labelledby="contact-title">
      <div class="section-heading">
        <h2 id="contact-title">Contact</h2>
        <span class="section-index" aria-hidden="true">07</span>
      </div>
      <p>For research correspondence and professional enquiries, please get in touch by email.</p>
      <dl class="contact-list">
        <div><dt>University</dt><dd><a href="mailto:{{ site.university_email }}">{{ site.university_email }}</a></dd></div>
        <div><dt>Personal</dt><dd><a href="mailto:{{ site.personal_email }}">{{ site.personal_email }}</a></dd></div>
        <div><dt>Website</dt><dd><a href="{{ site.personal_website }}">miyuruthathsara.com <span aria-hidden="true">↗</span></a></dd></div>
      </dl>
      <p class="personal-note">Outside research, I enjoy badminton, cricket, and chess, as well as sharing knowledge with the research community.</p>
    </section>
  </div>
</div>
