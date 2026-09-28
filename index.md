---
title: About
layout: default
permalink: /
interests:
  - Embedded Intelligence
  - Computer Architecture
  - Hardware Acceleration
  - Hardware–Software Co-design
---

<div class="profile-layout" id="about">
  <header class="profile-heading">
    <h1 id="profile-title">Miyuru Thathsara</h1>
    <p class="intro-subtitle">{{ site.data.profile.headline | escape }}, Singapore</p>
  </header>
  <aside class="profile-sidebar" aria-label="Photograph, profile links, and interests">
    <div class="profile-portrait">
      <div class="profile-photo-frame"><img class="profile-photo" src="{{ '/me.jpeg' | relative_url }}" alt="Miyuru Thathsara beside the Google sign" width="800" height="800" fetchpriority="high"></div>
    </div>
    {% include profile-links.html %}
    <section class="profile-interests" aria-labelledby="interests-title">
      <h2 id="interests-title">Interests</h2>
      <ul role="list">{% for interest in page.interests %}<li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 5v15M12 5C9 3 6 3 3 4v14c3-1 6-1 9 2 3-3 6-3 9-2V4c-3-1-6-1-9 1Z"/></svg><span>{{ interest | escape }}</span></li>{% endfor %}</ul>
    </section>
  </aside>
  <div class="profile-content">
    <section class="introduction" aria-labelledby="profile-title">
      {% for paragraph in site.data.profile.summary %}<p>{{ paragraph | escape }}</p>{% endfor %}
      <div class="profile-actions">
        <a class="text-link" href="{{ '/contact/' | relative_url }}">Contact me <span aria-hidden="true">↗</span></a>
      </div>
      <div class="profile-explore">
        <a href="{{ '/research/' | relative_url }}">Explore research <span aria-hidden="true">↗</span></a>
        <a href="{{ '/news/' | relative_url }}">Read the latest news <span aria-hidden="true">↗</span></a>
      </div>
    </section>
  </div>
</div>
