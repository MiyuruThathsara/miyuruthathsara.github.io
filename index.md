---
title: Miyuru Thathsara
layout: default
permalink: /
---

<div class="profile-layout">
  <header class="profile-heading">
    <p class="eyebrow">Embedded Intelligence <span aria-hidden="true">|</span> Hardware Acceleration</p>
    <h1 id="profile-title">Miyuru Thathsara</h1>
    <p class="intro-subtitle">{{ site.data.profile.headline | escape }}</p>
    <p class="profile-college">College of Computing and Data Science (CCDS) <span aria-hidden="true">·</span> Singapore</p>
  </header>
  <aside class="profile-sidebar" aria-label="Photograph and profile links">
    <div class="profile-portrait">
      <div class="profile-photo-frame"><img class="profile-photo" src="{{ '/me.jpeg' | relative_url }}" alt="Miyuru Thathsara beside the Google sign" width="800" height="800" fetchpriority="high"></div>
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
      {% for paragraph in site.data.profile.summary %}<p>{{ paragraph | escape }}</p>{% endfor %}
      <div class="profile-actions">
        <a class="text-link" href="{{ '/contact/' | relative_url }}">Contact me <span aria-hidden="true">↗</span></a>
      </div>
      <div class="profile-explore">
        <a href="{{ '/research/' | relative_url }}">Explore my research <span aria-hidden="true">↗</span></a>
        <a href="{{ '/publications/' | relative_url }}">Browse publications <span aria-hidden="true">↗</span></a>
        <a href="{{ '/news/' | relative_url }}">Read the latest news <span aria-hidden="true">↗</span></a>
      </div>
    </section>
  </div>
</div>
