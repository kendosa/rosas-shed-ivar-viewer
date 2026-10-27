#!/usr/bin/env python3
"""
Rough geometry extractor for SketchUp 2021+ .skp files (no SketchUp needed).

The .skp is a small header followed by a ZIP. Inside, model.dat holds the
binary model. This script finds:
  • component definition names and their bounding boxes
  • vertex records (3 doubles, inches) grouped by the definition they belong to
  • instance transforms (3x3 rotation + translation)

It is heuristic — it's how room.js was derived — so sanity-check results
against SketchUp before trusting a new model.

Usage:
  python3 tools/extract_skp.py "reference/Rosas Shed - V2.skp" > reference/extracted.json
"""
import io, json, re, struct, sys, zipfile

VERTEX_TAG = b"\xc5\x09\x18\x00\x00\x00"   # precedes each vertex's 24-byte xyz
DEF_NAME_TAG = b"\x7e\x15"                  # precedes a definition name (u32 length + utf-8)


def load_model(path):
    data = open(path, "rb").read()
    z = zipfile.ZipFile(io.BytesIO(data[data.find(b"PK\x03\x04"):]))
    return z.read("model.dat"), z.namelist()


def definitions(d):
    out = []
    for m in re.finditer(re.escape(DEF_NAME_TAG), d):
        n = struct.unpack_from("<I", d, m.end())[0]
        if not 0 < n < 64:
            continue
        raw = d[m.end() + 4 : m.end() + 4 + n]
        try:
            name = raw.decode("utf-8")
        except UnicodeDecodeError:
            continue
        if not name.isprintable():
            continue
        # bounding box max corner (3 doubles) sits just before the name record
        bb = struct.unpack_from("<3d", d, m.start() - 46)
        out.append({"name": name, "offset": m.start(), "bbox_max": [round(v, 3) for v in bb]})
    return out


def vertices(d):
    for m in re.finditer(re.escape(VERTEX_TAG), d):
        x, y, z = struct.unpack_from("<3d", d, m.end())
        yield m.end(), [round(x, 3), round(y, 3), round(z, 3)]


def transforms(d):
    """Find 4x3 transforms: 9 rotation doubles that form an orthonormal basis + translation."""
    found = []
    for i in range(0, len(d) - 104):
        v = struct.unpack_from("<12d", d, i)
        r = v[:9]
        if not all(abs(a) <= 1.0000001 for a in r):
            continue
        cols = [r[0:3], r[3:6], r[6:9]]
        if not all(abs(sum(c * c for c in col) - 1) < 1e-6 for col in cols):
            continue
        if any(abs(t) > 1e5 or t != t for t in v[9:12]):
            continue
        found.append({"offset": i, "rotation": [round(a, 4) for a in r], "translation": [round(t, 3) for t in v[9:12]]})
    return found


def main(path):
    d, names = load_model(path)
    defs = definitions(d)
    by_def = {}
    for off, xyz in vertices(d):
        # geometry for a definition is stored before its name record
        owner = next((df["name"] for df in defs if df["offset"] > off), "?")
        by_def.setdefault(owner, []).append(xyz)
    print(json.dumps({
        "zip_entries": names,
        "definitions": defs,
        "vertices_by_definition": by_def,
        "transforms": transforms(d),
        "units": "inches",
    }, indent=2))


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "reference/Rosas Shed - V2.skp")
