// ソートアルゴリズムの実装
// 各アルゴリズムは実行ステップを配列として返す

class SortingAlgorithms {
    constructor() {
        this.steps = [];
    }

    // ステップを記録するヘルパー関数
    recordStep(array, type, indices = [], extra = {}) {
        this.steps.push({
            array: [...array],
            type: type, // 'compare', 'swap', 'pivot', 'sorted', 'merge'
            indices: [...indices],
            ...extra
        });
    }

    // クイックソート
    quickSort(arr) {
        this.steps = [];
        const array = [...arr];
        this.quickSortHelper(array, 0, array.length - 1);
        // 最終的に全体をソート済みとしてマーク
        this.recordStep(array, 'completed', []);
        return this.steps;
    }

    quickSortHelper(array, low, high) {
        if (low < high) {
            const pivotIndex = this.partition(array, low, high);
            this.quickSortHelper(array, low, pivotIndex - 1);
            this.quickSortHelper(array, pivotIndex + 1, high);
        }
    }

    partition(array, low, high) {
        const pivot = array[high];
        let pivotIndex = high;
        this.recordStep(array, 'pivot', [pivotIndex], { pivotIndex: pivotIndex });
        
        let i = low - 1;

        for (let j = low; j < high; j++) {
            this.recordStep(array, 'compare', [j], { pivotIndex: pivotIndex });
            
            if (array[j] <= pivot) {
                i++;
                if (i !== j) {
                    [array[i], array[j]] = [array[j], array[i]];
                    this.recordStep(array, 'swap', [i, j], { pivotIndex: pivotIndex });
                }
            }
        }

        // ピボットを正しい位置に移動
        [array[i + 1], array[pivotIndex]] = [array[pivotIndex], array[i + 1]];
        this.recordStep(array, 'swap', [i + 1, pivotIndex], { pivotIndex: pivotIndex });
        
        // ピボットが確定位置に
        this.recordStep(array, 'sorted', [i + 1]);

        return i + 1;
    }

    // マージソート
    mergeSort(arr) {
        this.steps = [];
        const array = [...arr];
        this.mergeSortHelper(array, 0, array.length - 1);
        this.recordStep(array, 'completed', []);
        return this.steps;
    }

    mergeSortHelper(array, left, right) {
        if (left < right) {
            const mid = Math.floor((left + right) / 2);
            
            this.mergeSortHelper(array, left, mid);
            this.mergeSortHelper(array, mid + 1, right);
            this.merge(array, left, mid, right);
        }
    }

    merge(array, left, mid, right) {
        const leftArr = array.slice(left, mid + 1);
        const rightArr = array.slice(mid + 1, right + 1);

        let i = 0, j = 0, k = left;

        while (i < leftArr.length && j < rightArr.length) {
            this.recordStep(array, 'compare', [left + i, mid + 1 + j]);
            
            if (leftArr[i] <= rightArr[j]) {
                array[k] = leftArr[i];
                i++;
            } else {
                array[k] = rightArr[j];
                j++;
            }
            this.recordStep(array, 'merge', [k]);
            k++;
        }

        while (i < leftArr.length) {
            array[k] = leftArr[i];
            this.recordStep(array, 'merge', [k]);
            i++;
            k++;
        }

        while (j < rightArr.length) {
            array[k] = rightArr[j];
            this.recordStep(array, 'merge', [k]);
            j++;
            k++;
        }

        // マージ完了後、その範囲をソート済みとしてマーク
        for (let idx = left; idx <= right; idx++) {
            this.recordStep(array, 'sorted', [idx]);
        }
    }

    // バブルソート
    bubbleSort(arr) {
        this.steps = [];
        const array = [...arr];
        const n = array.length;

        for (let i = 0; i < n - 1; i++) {
            let swapped = false;
            
            for (let j = 0; j < n - i - 1; j++) {
                this.recordStep(array, 'compare', [j, j + 1]);
                
                if (array[j] > array[j + 1]) {
                    [array[j], array[j + 1]] = [array[j + 1], array[j]];
                    this.recordStep(array, 'swap', [j, j + 1]);
                    swapped = true;
                }
            }
            
            // 各パスの最後の要素はソート済み
            this.recordStep(array, 'sorted', [n - i - 1]);
            
            if (!swapped) break;
        }

        this.recordStep(array, 'completed', []);
        return this.steps;
    }

    // 選択ソート
    selectionSort(arr) {
        this.steps = [];
        const array = [...arr];
        const n = array.length;

        for (let i = 0; i < n - 1; i++) {
            let minIdx = i;
            this.recordStep(array, 'minimum', [minIdx]);
            
            for (let j = i + 1; j < n; j++) {
                this.recordStep(array, 'compare', [j]);
                
                if (array[j] < array[minIdx]) {
                    minIdx = j;
                    this.recordStep(array, 'minimum', [minIdx]);
                }
            }

            if (minIdx !== i) {
                [array[i], array[minIdx]] = [array[minIdx], array[i]];
                this.recordStep(array, 'swap', [i, minIdx]);
            }
            
            this.recordStep(array, 'sorted', [i]);
        }

        this.recordStep(array, 'sorted', [n - 1]);
        this.recordStep(array, 'completed', []);
        return this.steps;
    }

    // 挿入ソート
    insertionSort(arr) {
        this.steps = [];
        const array = [...arr];
        const n = array.length;

        // 最初の要素は整列済み部分として薄い緑色
        this.recordStep(array, 'sorted-light', [0]);

        for (let i = 1; i < n; i++) {
            const key = array[i];
            let j = i - 1;

            // 挿入する要素をハイライト
            this.recordStep(array, 'inserting', [i]);

            while (j >= 0 && array[j] > key) {
                this.recordStep(array, 'compare', [j]);
                array[j + 1] = array[j];
                this.recordStep(array, 'swap', [j, j + 1]);
                j--;
            }

            array[j + 1] = key;
            
            // 整列済み部分を更新（薄い緑色）
            const sortedIndices = [];
            for (let k = 0; k <= i; k++) {
                sortedIndices.push(k);
            }
            this.recordStep(array, 'sorted-light', sortedIndices, { sortedIndices });
        }

        // 完全に整列したので濃い緑色に
        this.recordStep(array, 'completed', []);
        return this.steps;
    }
}

// アルゴリズム情報
const algorithmInfo = {
    quick: {
        name: 'クイックソート',
        displayName: '🚀 クイックソート',
        description: '分割統治法による高速ソート'
    },
    merge: {
        name: 'マージソート',
        displayName: '🔀 マージソート',
        description: '安定な分割統治法'
    },
    bubble: {
        name: 'バブルソート',
        displayName: '🔵 バブルソート',
        description: '隣接要素の交換'
    },
    selection: {
        name: '選択ソート',
        displayName: '🔍 選択ソート',
        description: '最小値を選択'
    },
    insertion: {
        name: '挿入ソート',
        displayName: '📥 挿入ソート',
        description: '整列済み部分に挿入'
    }
};
