---
title: About
layout: default
permalink: /
profile_highlights:
  - "final-year PhD candidate in Computer Science"
  - "My research focuses on building efficient onboard computing systems"
  - "computer vision, robotics, computer architecture, and hardware-software co-design"
  - "my broader research direction is collaborative localization and autonomy"
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
      {% for paragraph in site.data.profile.summary %}
        {% assign bio_paragraph = paragraph | escape %}
        {% for phrase in page.profile_highlights %}
          {% assign escaped_phrase = phrase | escape %}
          {% capture highlight %}<strong>{{ escaped_phrase }}</strong>{% endcapture %}
          {% assign bio_paragraph = bio_paragraph | replace_first: escaped_phrase, highlight %}
        {% endfor %}
        <p>{{ bio_paragraph }}</p>
      {% endfor %}
    </section>
  </div>
</div>
