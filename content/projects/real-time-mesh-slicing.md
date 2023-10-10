+++
template = "project.html"
title = "Real-time mesh slicing"
date = "2013-03-20"
[extra]
video_link = "https://www.youtube.com/watch?v=RUmYGWk-9zU"
source_link = "https://github.com/Catchouli/RealTimeMeshSlicing"
images = [
    "/images/projects/real-time-mesh-slicing/1.jpg"
]
+++
I needed a real-time mesh slicing effect for a project a friend was working on so I put together this test application to demonstrate the technique.

It works by first dividing the list of triangles in a mesh into two, one set for each side of the plane. For triangles that intersect the plane, it divides them and adds them to one side or the other.

This implementation is implemented on the CPU as a test but it should be heavily parallelisable.

Written in C++/OpenGL
<!-- more -->
