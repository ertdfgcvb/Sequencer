// Returns an array of strings parsed from two filenames like
// first : DSC00998.jpg
// last  : DSC01112.jpg
// by extracting the base name, the number (with or without leading zeros),
// the extension, etc.
// An optional step parameter can be passed; it defaults to 1.
// Returns an empty array and a warning in the console
// if the parsing wasn't successful.
export function parse(first, last, every=1) {

    // The output array to populate
    const out = []

    const a = last_number(first)
    if (a === "") {
        warn("the first filename doesn’t contain a number.")
        return out
    }

    const b = last_number(last)
    if (b === "") {
        warn("the last filename doesn’t contain a number.")
        return out
    }

    const before = basename_before(first)
    const after = basename_after(first)
    if (before != basename_before(last) || after != basename_after(last)) {
        warn("the base-names of '" + first + "' and '" + last + "' don’t match.")
        return out
    }

    const has_leading_zeroes = a.charAt(0) == 0 || b.charAt(0) == 0
    if (has_leading_zeroes && a.length != b.length) {
        warn("wrong number of leading zeros.")
        return out
    }

    const num_a = parseInt(a)
    const num_b = parseInt(b)

    if (has_leading_zeroes) {
        for (let i=num_a; i<num_b; i+=every) {
            out.push(before + (i + "").padStart(a.length, "0") + after)
        }
    } else {
        for (let i=num_a; i<num_b; i+=every) {
            out.push(before + i + after)
        }
    }

    return out
}

// Returns the part of a string before the last found number
// Returns an empty string if no number is present
// basename_before('folder32/98.jpg') "folder32/"
// basename_before('abc.jpg') ""
export function basename_before(filename){
    const n = last_number(filename)
    if (n === "") return ""
    return filename.split(n)[0]
}

// Returns the part of a string after the last found number
// Returns the string if no number is present
// This allows to reconstruct a valid filename width:
// basename_before() + last_number() + basename_after()
// even if non number is present.
// basename_after('folder32/98.jpg') ".jpg"
// basename_after('abc.jpg') "abc.jpg"
export function basename_after(filename){
    const n = last_number(filename)
    if (n === "") return filename
    return filename.split(n)[1]
}

// Returns the last positive number in a string (with leading zeros)
// Returns an empty string if no number is present
// last_number('folder32/98.jpg') "98"
// last_number('abc.jpg') ""
export function last_number(filename) {
    const m = filename.match(/\d+(?!.*\d)/g)
    if (m === null) return ""
    return m[0]
}

function warn(msg) {
    console.warn("Can’t parse the file sequence correctly, returning [].\nReason: " + msg)
}
