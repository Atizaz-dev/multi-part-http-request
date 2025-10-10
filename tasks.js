let start = Date.now()
function task1(time) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve("task 1 completed")
            // console.log(`task 1 complete in ${Date.now() - start}ms`)
        }, time)
    })
        .then(() => {
            console.log(`task 1 complete in ${Date.now() - start}ms`)
            return new Promise((resolve) => resolve("task 1 completed"));
        })
}



function task2(time) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve("task 2 completed")
            // console.log(`task 2 complete in: ${Date.now() - start}ms`)
        }, time);
    }).then(() => {
        console.log(`task 2 complete in: ${Date.now() - start}ms`)
        return new Promise((resolve) => resolve("task 2 completed"));
    })
}

function task3(time) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve("task 3 completed")
            // console.log(`task 3 complete in: ${Date.now() - start}ms`)
        }, time);
    })
        .then(() => {
            console.log(`task 3 complete in: ${Date.now() - start}ms`)
            return new Promise((resolve) => resolve("task 3 completed"));
        })
}
Promise.all([task1(5000), task2(1000), task3(9000)])
    .then((value) => console.log(value)) //['task 1 completed', 'task 2 completed', 'task 3 completed']
    .catch((error) => console.log(error))
