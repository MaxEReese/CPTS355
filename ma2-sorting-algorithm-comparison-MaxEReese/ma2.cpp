#include <iostream>
#include <vector>
#include <cstdlib>
#include <ctime>
#include <chrono>
#include <algorithm>
#include <numeric>
#include <cmath>

using namespace std;

//find the partition for a given vector
int myPartition(vector<int> &arr, int leftIndex, int rightIndex) {

    // Selecting last element in the vector to be the pivot
    int pivot = arr[rightIndex];

    // Index of elemment just before the last element
    int i = (leftIndex - 1);

    //loop through the vector and compare every element to the pivot
    for (int j = leftIndex; j <= rightIndex - 1; j++) 
    {
        // If current element is smaller than or equal to pivot
        if (arr[j] <= pivot) 
        {
            i++;
            swap(arr[i], arr[j]); //swap item i with item j
        }
    }

    // swap the pivot with the larger item i
    swap(arr[i + 1], arr[rightIndex]);

    // Return the point of partition
    return (i + 1);
}

void insertionSort(vector<int> &arr)
{
    for (size_t i = 1; i < arr.size(); ++i)
    {
        int key = arr[i];
        size_t j = i;
        while (j > 0 && arr[j - 1] > key)
        {
            arr[j] = arr[j - 1];
            --j;
        }
        arr[j] = key;
    }
}

void quickSort(vector<int> &arr, int leftIndex, int rightIndex)
{
    if (leftIndex < rightIndex) //if the left index is less than the right index (array size is larger than 2)
    {
        //find the pivot
        int pivot = myPartition(arr, leftIndex, rightIndex);

        // recursive call on the left of pivot
        quickSort(arr, leftIndex, pivot - 1);

        // recursive call on the right of pivot
        quickSort(arr, pivot + 1, rightIndex);
    }
}

void shellSort(vector<int> &arr, int initialGap)
{
    //while gap > 0
    for (int gap = initialGap; gap > 0; gap /= 2)
    {
        //loop through the array starting from the gap
        for (int i = gap; i < arr.size(); i++)
        {
            int temp = arr[i]; //store the current item in temp
            int e = i; //index for comparison
            
            //loop until reaching the start of the array or finding an item smaller than the current item
            while (e >= gap && arr[e - gap] > temp)
            {
                arr[e] = arr[e - gap]; //move the item 'gap' spaces forwards
                e -= gap; //move 'gap' indexes backwards in the array
            }
            arr[e] = temp; //insert temp into the proper index
        }
    }
}


void printStatistics(const vector<double> &durations)
{
    double minTime = *min_element(durations.begin(), durations.end());
    double maxTime = *max_element(durations.begin(), durations.end());
    double avgTime = accumulate(durations.begin(), durations.end(), 0.0) / durations.size();

    double variance = 0.0;
    for (double t : durations)
    {
        variance += (t - avgTime) * (t - avgTime);
    }
    double stdDev = sqrt(variance / durations.size());

    cout << "\n=== Statistics ===\n";
    cout << "Min Time: " << minTime << " ms\n";
    cout << "Max Time: " << maxTime << " ms\n";
    cout << "Average Time: " << avgTime << " ms\n";
    cout << "Standard Deviation: " << stdDev << " ms\n";
}

int main()
{
    // Size of the collection
    const int N = 10000;
    // Max limit for the random generation
    const int MAX_VAL = 100000;
    // Total trial (use the same for other sorting algorithms)
    const int TRIALS = 10;

    srand(static_cast<unsigned>(time(nullptr)));

    vector<double> durations;

    for (int trial = 0; trial < TRIALS; ++trial)
    {
        vector<int> data(N);
        // Generate 10,000 random numbers and populate data
        for (int i = 0; i < N; ++i)
        {
            data[i] = rand() % (MAX_VAL + 1);
        }

        auto start = chrono::high_resolution_clock::now();
        insertionSort(data); // sort data
        auto end = chrono::high_resolution_clock::now();

        chrono::duration<double, milli> elapsed = end - start;
        durations.push_back(elapsed.count());

        cout << "Insertion Sort Trial " << trial + 1 << " duration: " << elapsed.count() << " ms\n";
    }

    printStatistics(durations);
    durations.clear();

    cout << "\n___________Quick Sort Trials______________" << endl;

    for (int trial = 0; trial < TRIALS; ++trial)
    {
        vector<int> data(N);
        // Generate 10,000 random numbers and populate data
        for (int i = 0; i < N; ++i)
        {
            data[i] = rand() % (MAX_VAL + 1);
        }

        auto start = chrono::high_resolution_clock::now();
        quickSort(data, 0, data.size()-1); // sort data
        auto end = chrono::high_resolution_clock::now();

        chrono::duration<double, milli> elapsed = end - start;
        durations.push_back(elapsed.count());

        cout << "Quick Sort Trial " << trial + 1 << " duration: " << elapsed.count() << " ms\n";
    }

    printStatistics(durations);
    durations.clear();

    cout << "\n___________Shell Sort Trials______________" << endl;

    for (int trial = 0; trial < TRIALS; ++trial)
    {
        vector<int> data(N);
        // Generate 10,000 random numbers and populate data
        for (int i = 0; i < N; ++i)
        {
            data[i] = rand() % (MAX_VAL + 1);
        }

        auto start = chrono::high_resolution_clock::now();
        shellSort(data, 1); // sort data
        auto end = chrono::high_resolution_clock::now();

        chrono::duration<double, milli> elapsed = end - start;
        durations.push_back(elapsed.count());

        cout << "gap size 1 Shell Sort Trial " << trial + 1 << " duration: " << elapsed.count() << " ms\n";
    }

    printStatistics(durations);
    durations.clear();

    cout << "\n";

    for (int trial = 0; trial < TRIALS; ++trial)
    {
        vector<int> data(N);
        // Generate 10,000 random numbers and populate data
        for (int i = 0; i < N; ++i)
        {
            data[i] = rand() % (MAX_VAL + 1);
        }

        auto start = chrono::high_resolution_clock::now();
        shellSort(data, 10); // sort data
        auto end = chrono::high_resolution_clock::now();

        chrono::duration<double, milli> elapsed = end - start;
        durations.push_back(elapsed.count());

        cout << "gap size 10 Shell Sort Trial " << trial + 1 << " duration: " << elapsed.count() << " ms\n";
    }

    printStatistics(durations);
    durations.clear();

    cout << "\n";

    for (int trial = 0; trial < TRIALS; ++trial)
    {
        vector<int> data(N);
        // Generate 10,000 random numbers and populate data
        for (int i = 0; i < N; ++i)
        {
            data[i] = rand() % (MAX_VAL + 1);
        }

        auto start = chrono::high_resolution_clock::now();
        shellSort(data, 100); // sort data
        auto end = chrono::high_resolution_clock::now();

        chrono::duration<double, milli> elapsed = end - start;
        durations.push_back(elapsed.count());

        cout << "gap size 100 Shell Sort Trial " << trial + 1 << " duration: " << elapsed.count() << " ms\n";
    }

    printStatistics(durations);
    durations.clear();

    cout << "\n";

    for (int trial = 0; trial < TRIALS; ++trial)
    {
        vector<int> data(N);
        // Generate 10,000 random numbers and populate data
        for (int i = 0; i < N; ++i)
        {
            data[i] = rand() % (MAX_VAL + 1);
        }

        auto start = chrono::high_resolution_clock::now();
        shellSort(data, 500); // sort data
        auto end = chrono::high_resolution_clock::now();

        chrono::duration<double, milli> elapsed = end - start;
        durations.push_back(elapsed.count());

        cout << "gap size 500 Shell Sort Trial " << trial + 1 << " duration: " << elapsed.count() << " ms\n";
    }

    printStatistics(durations);
    durations.clear();


    return 0;
}
