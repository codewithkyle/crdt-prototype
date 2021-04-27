function diffDeletes(current, input, keypath = ""){
    let ops = [];
    for (const key in current){
        if (input?.[key]){
            if (typeof current[key] === "object" && !Array.isArray(current[key])){
                ops = [...ops, ...diffDeletes(current[key], input[key], keypath ? `${keypath}::${key}` : key)];
            }
        } else {
            ops.push({
                op: "UNSET",
                keypath: keypath ? `${keypath}::${key}` : key,
                tombstone: current[key],
            });
        }
    }
    return ops;
}

function diffInserts(current, input, keypath = ""){
    let ops = [];
    for (const key in input){
        if (current?.[key]){
            if (typeof input[key] === "object" && !Array.isArray(input[key])){
                ops = [...ops, ...diffInserts(current[key], input[key], keypath ? `${keypath}::${key}` : key)];
            }
        } else {
            ops.push({
                op: "SET",
                keypath: keypath ? `${keypath}::${key}` : key,
                value: input[key],
            });
        }
    }
    return ops;
}

function throwableDiff(current, input){
    if (Array.isArray(current)){
        if (!Array.isArray(input)){
            throw "input isn't an array";
        }
        for (let i = 0; i < current.length; i++){
            if (input?.[i]){
                switch (typeof current[i]){
                    case "object":
                        throwableDiff(current[i], input[i]);
                        break;
                    default:
                        if (current[i] !== input[i]){
                            throw "values don't match";
                        }
                        break;
                }   
            } else {
                throw `${i} doesn't exist`;
            }
        }
    } else {
        if (Array.isArray(input)){
            throw "input isn't an object";
        }
        for (const key in current){
            if (input?.[key]){
                switch (typeof current[key]){
                    case "object":
                        throwableDiff(current[key], input[key]);
                        break;
                    default:
                        if (current[key] !== input[key]){
                            throw "values don't match";
                        }
                        break;
                }
            } else {
                throw `${key} doesn't exist`;
            }
        }
    }
}

function diffChanges(current, input, keypath = ""){
    let ops = [];
    for (const key in current){
        if (input?.[key]){
            switch (typeof current[key]){
                case "object":
                    if (!Array.isArray(current[key])){
                        ops = [...ops, ...diffChanges(current[key], input[key], keypath ? `${keypath}::${key}` : key)];
                    } else {
                        let override = false;
                        if (!Array.isArray(input[key])){
                            override = true;
                        } else if (input[key].length !== current[key].length){
                            override = true;
                        } else {
                            try{
                                throwableDiff(current[key], input[key]);
                            } catch (e) {
                                override = true;
                            }
                        }
                        if (override){
                            ops.push({
                                op: "SET",
                                keypath: keypath ? `${keypath}::${key}` : key,
                                value: input[key],
                            });
                        }
                    }
                    break;
                default:
                    if (current[key] !== input[key]){
                        ops.push({
                            op: "SET",
                            keypath: keypath ? `${keypath}::${key}` : key,
                            value: input[key],
                        });
                    }
                    break;
            }
        }
    }
    return ops;
}

function diff(current, input, table, key){
    let ops = [];
    ops = [...ops, ...diffDeletes(current, input)];
    ops = [...ops, ...diffInserts(current, input)];
    ops = [...ops, ...diffChanges(current, input)];
    for (let i = 0; i < ops.length; i++){
        ops[i]["table"] = table;
        ops[i]["key"] = key;
    }
    return ops;
}
module.exports = diff;