+++
template = "project.html"
title = "Neuron"
date = "2016-03-20"
[extra]
source_link = "https://github.com/catchouli/neuron"
images = [
    "/images/projects/neuron/1.png",
    "/images/projects/neuron/2.png"
]
+++
A Haskell MNIST recognition neural network trainer and solver.

I implemented this a few years ago when I was trying to learn the basics of neural networks and machine learning. It's a feed-forward neural network, optimised using gradient descent. I also implemented an accelerated version using matrices and hmatrix.

It's quite pleasant to implement this kind of thing in haskell since a lot of the required calculations are implemented naturally as pure functions, and in some cases it's possible to use automatic differentation to derive the necessary derivatives. 
