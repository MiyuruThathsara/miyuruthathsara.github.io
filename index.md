---
title: About
layout: default
permalink: /
---

<div class="profile-layout" id="about">
  <header class="profile-heading">
    <p class="eyebrow">Embedded Intelligence <span aria-hidden="true">|</span> Hardware Acceleration</p>
    <h1 id="profile-title">Miyuru Thathsara</h1>
    <p class="intro-subtitle">{{ site.data.profile.headline | escape }}, Singapore</p>
  </header>
  <aside class="profile-sidebar" aria-label="Photograph and profile links">
    <div class="profile-portrait">
      <div class="profile-photo-frame"><img class="profile-photo" src="{{ '/me.jpeg' | relative_url }}" alt="Miyuru Thathsara beside the Google sign" width="800" height="800" fetchpriority="high"></div>
    </div>
    {% include profile-links.html %}
  </aside>
  <div class="profile-content">
    <section class="introduction" aria-labelledby="profile-title">
      {% for paragraph in site.data.profile.summary %}<p>{{ paragraph | escape }}</p>{% endfor %}
      <div class="profile-actions">
        <a class="text-link" href="{{ '/contact/' | relative_url }}">Contact me <span aria-hidden="true">↗</span></a>
      </div>
      <div class="profile-explore">
        <a href="{{ '/research/' | relative_url }}">Explore research &amp; publications <span aria-hidden="true">↗</span></a>
        <a href="{{ '/news/' | relative_url }}">Read the latest news <span aria-hidden="true">↗</span></a>
      </div>
    </section>
  </div>
</div>
