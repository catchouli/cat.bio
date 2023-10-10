+++
template = "project.html"
title = "Heterogeneous sparse voxel octree raytracing"
date = "2014-03-30"
[extra]
link = "https://cat.bio/dissertation.pdf"
video_link = "https://www.youtube.com/watch?v=tK55MApXod0"
source_link = "http://github.com/catchouli/VolumeRender"
images = [
    "/images/projects/svo/1.png",
    "/images/projects/svo/2.png",
    "/images/projects/svo/3.jpg"
]
+++
This volume renderer was made as part of the dissertation I completed for my bachelors degree.

It first converts the scene into a sparse voxel octree format, which can then be traversed efficiently for real-time raytracing.

The transparency works by sampling iteratively at points through refractive mediums and the volume can even have a heterogeneous refractive index (i.e. it changes throughout the medium).

My dissertation itself can be read at the link above and the source code is also available.
<!-- more -->
