[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/Vd8os_ov)
# WSU_CPTS223_MA2
Skeleton code for MA2

In the trials Quick sort had by far the fastest average times being almost 100x faster than insertion sort and depending on the gap could be 100-2x faster than shell sort I believe that quick sort is so much faster because insertion sort and shell sort onlyt sort one element at a time while quick sorts "chunks" of the array at a time by splitting it into halves and sorting it, in a general sense it breaks the process of sorting up into different parts making it faster.

with shell sort i tested 3 gaps, a gap of 1, 10, 100, and 500. I started with 1 and 10 at first which made me see that a gap of 1 is the same as insertion sort and a gap of 10 was around 10x faster than gap 1. Due to this i wanted to test larger numbers so i chose 100 and 500 which were around 5x faster than a gap of 10 but compared to each other a gap of 100 and 500 had very similar average times with 500 being slightly faster on average. After testing of the gaps i tested 500 would be the prefered one because it was slightly faster than 100
