export function pluralize(s, amt) {
    if(amt != 1) {
        s += "s";
    }
    return s;
}
