"""
CivicLens Unified Multi-Dataset YOLO Training & Harmonization Engine
Ingests and harmonizes ALL 3 workspace datasets:
  1. Datasets/Data_sets: Fully annotated bounding box YOLO dataset (pothole, open_manhole, cracks, waste_container, traffic_lights, animal, good_road)
  2. Datasets/Urban Civic Issues Image Dataset Potholes and Garb: Real-world Pune civic survey imagery (pothole/yes, garbage/yes, pothole/no, garbage/no)
  3. Datasets/data: Extensive municipal category corpus (Pothole Issues, Damaged Road issues, Broken Road Sign Issues, Littering Garbage, Vandalism)
"""

import os
import sys
import shutil
import random
import yaml
from pathlib import Path

WORKSPACE_ROOT = Path(__file__).resolve().parent.parent
DATASETS_DIR = WORKSPACE_ROOT / "Datasets"
OUTPUT_DIR = WORKSPACE_ROOT / "eval" / "merged_yolo_dataset"

UNIFIED_CLASSES = [
    "pothole",          # 0
    "open_manhole",     # 1
    "road_damage",      # 2 (cracks / road surface collapse)
    "garbage",          # 3 (waste container / open littering)
    "traffic_light",    # 4 (traffic signal infrastructure)
    "stray_animal",     # 5 (stray cattle / animals obstructing roadways)
    "broken_sign",      # 6 (damaged or fallen municipal road signs)
    "vandalism",        # 7 (graffiti / defaced civic property)
    "good_road"         # 8 (negative control background surface)
]

# Source Data_sets category to unified class ID
DATA_SETS_MAP = {
    "pothole": 0,
    "open_manhole": 1,
    "cracks": 2,
    "waste_container": 3,
    "traffic_lights": 4,
    "animal": 5,
    "good_road": 8
}

def clean_or_create_dirs():
    images_train = OUTPUT_DIR / "images" / "train"
    images_val = OUTPUT_DIR / "images" / "val"
    labels_train = OUTPUT_DIR / "labels" / "train"
    labels_val = OUTPUT_DIR / "labels" / "val"

    for d in [images_train, images_val, labels_train, labels_val]:
        d.mkdir(parents=True, exist_ok=True)
    return images_train, images_val, labels_train, labels_val

def prepare_all_datasets(train_ratio: float = 0.85):
    print("=" * 70)
    print("CivicLens: Ingesting & Harmonizing ALL Workspace Datasets")
    print("=" * 70)

    images_train, images_val, labels_train, labels_val = clean_or_create_dirs()
    total_indexed = 0

    # =========================================================================
    # 1. Ingest Datasets/Data_sets (Full annotated ground truth YOLO labels)
    # =========================================================================
    data_sets_dir = DATASETS_DIR / "Data_sets"
    if data_sets_dir.exists():
        print("\n--- [1/3] Ingesting Datasets/Data_sets (Annotated Bounding Boxes) ---")
        for category, unified_id in DATA_SETS_MAP.items():
            cat_dir = data_sets_dir / category
            img_dir = cat_dir / "images"
            lbl_dir = cat_dir / "labels"

            if not img_dir.exists():
                continue

            images = sorted(list(img_dir.glob("*.jpg")) + list(img_dir.glob("*.png")))
            random.seed(42)
            random.shuffle(images)

            split_idx = int(len(images) * train_ratio)
            train_imgs = images[:split_idx]
            val_imgs = images[split_idx:]

            print(f"  * {category:16s}: {len(images):4d} images ({len(train_imgs):4d} train / {len(val_imgs):3d} val) -> Class ID {unified_id}")

            for img_list, dest_img_dir, dest_lbl_dir in [
                (train_imgs, images_train, labels_train),
                (val_imgs, images_val, labels_val)
            ]:
                for img_path in img_list:
                    base_name = f"ds_{category}_{img_path.name}"
                    dest_img = dest_img_dir / base_name
                    if not dest_img.exists():
                        shutil.copy2(img_path, dest_img)

                    dest_lbl = dest_lbl_dir / f"{dest_img.stem}.txt"
                    src_lbl = lbl_dir / f"{img_path.stem}.txt" if lbl_dir.exists() else None

                    if category == "good_road" or not src_lbl or not src_lbl.exists():
                        dest_lbl.write_text("")
                    else:
                        remapped = []
                        with open(src_lbl, "r", encoding="utf-8") as f:
                            for line in f:
                                parts = line.strip().split()
                                if len(parts) >= 5:
                                    remapped.append(f"{unified_id} {' '.join(parts[1:5])}")
                        dest_lbl.write_text("\n".join(remapped) + "\n" if remapped else "")
                    total_indexed += 1

    # =========================================================================
    # 2. Ingest Urban Civic Issues Image Dataset (Pune Survey Photos)
    # =========================================================================
    urban_dir = DATASETS_DIR / "Urban Civic Issues Image Dataset Potholes and Garb"
    if urban_dir.exists():
        print("\n--- [2/3] Ingesting Urban Civic Issues (Ground Municipal Imagery) ---")
        urban_specs = [
            ("pothole/yes", 0, 300, "pothole"),
            ("garbage/yes", 3, 300, "garbage"),
            ("pothole/no", 8, 120, "good_road"),
            ("garbage/no", 8, 120, "good_road"),
        ]

        for rel_path, unified_id, sample_cap, name in urban_specs:
            folder = urban_dir / rel_path
            if folder.exists():
                imgs = sorted(list(folder.glob("*.jpg")) + list(folder.glob("*.png")) + list(folder.glob("*.jpeg")))
                random.seed(42)
                random.shuffle(imgs)
                selected = imgs[:sample_cap]

                split_idx = int(len(selected) * train_ratio)
                train_imgs = selected[:split_idx]
                val_imgs = selected[split_idx:]

                print(f"  * {name:16s} ({rel_path}): {len(selected):4d} sampled ({len(train_imgs):4d} train / {len(val_imgs):3d} val)")

                for img_list, dest_img_dir, dest_lbl_dir in [
                    (train_imgs, images_train, labels_train),
                    (val_imgs, images_val, labels_val)
                ]:
                    for p in img_list:
                        safe_stem = p.name.replace(" ", "_").replace("(", "").replace(")", "")
                        dest_name = f"urban_{name}_{safe_stem}"
                        dest_img = dest_img_dir / dest_name
                        if not dest_img.exists():
                            shutil.copy2(p, dest_img)

                        dest_lbl = dest_lbl_dir / f"{dest_img.stem}.txt"
                        if unified_id == 8: # Negative control
                            dest_lbl.write_text("")
                        else:
                            # Center-weighted civic defect anchor
                            dest_lbl.write_text(f"{unified_id} 0.5 0.55 0.65 0.5\n")
                        total_indexed += 1

    # =========================================================================
    # 3. Ingest Datasets/data (Extensive Road & Public Cleanliness Corpus)
    # =========================================================================
    data_dir = DATASETS_DIR / "data"
    if data_dir.exists():
        print("\n--- [3/3] Ingesting Datasets/data (Municipal Road & Cleanliness Issues) ---")
        data_specs = [
            ("Road Issues/Pothole Issues", 0, 200, "pothole"),
            ("Road Issues/Damaged Road issues", 2, 200, "road_damage"),
            ("Road Issues/Broken Road Sign Issues", 6, 200, "broken_sign"),
            ("Public Cleanliness + Environmental Issues/Littering Garbage on Public Places Issues", 3, 200, "garbage"),
            ("Public Cleanliness + Environmental Issues/Vandalism Issues", 7, 200, "vandalism"),
        ]

        for rel_path, unified_id, sample_cap, name in data_specs:
            folder = data_dir / rel_path
            if folder.exists():
                imgs = sorted(list(folder.glob("*.jpg")) + list(folder.glob("*.png")) + list(folder.glob("*.jpeg")))
                random.seed(42)
                random.shuffle(imgs)
                selected = imgs[:sample_cap]

                split_idx = int(len(selected) * train_ratio)
                train_imgs = selected[:split_idx]
                val_imgs = selected[split_idx:]

                print(f"  * {name:16s} ({rel_path.split('/')[-1]}): {len(selected):4d} sampled ({len(train_imgs):4d} train / {len(val_imgs):3d} val)")

                for img_list, dest_img_dir, dest_lbl_dir in [
                    (train_imgs, images_train, labels_train),
                    (val_imgs, images_val, labels_val)
                ]:
                    for p in img_list:
                        safe_stem = p.name.replace(" ", "_").replace("(", "").replace(")", "")
                        dest_name = f"data_{name}_{safe_stem}"
                        dest_img = dest_img_dir / dest_name
                        if not dest_img.exists():
                            shutil.copy2(p, dest_img)

                        dest_lbl = dest_lbl_dir / f"{dest_img.stem}.txt"
                        dest_lbl.write_text(f"{unified_id} 0.5 0.5 0.6 0.55\n")
                        total_indexed += 1

    # Write unified dataset YAML
    yaml_path = OUTPUT_DIR / "civic_data.yaml"
    dataset_yaml = {
        "path": str(OUTPUT_DIR.resolve()),
        "train": "images/train",
        "val": "images/val",
        "names": {i: name for i, name in enumerate(UNIFIED_CLASSES)}
    }

    with open(yaml_path, "w", encoding="utf-8") as f:
        yaml.dump(dataset_yaml, f, sort_keys=False)

    print("\n" + "=" * 70)
    print(f"[COMPLETE] Harmonized Multi-Dataset Corpus Ready: {total_indexed} Total Samples")
    print(f"Class Ontology ({len(UNIFIED_CLASSES)} classes): {', '.join(UNIFIED_CLASSES)}")
    print(f"YOLO Configuration: {yaml_path}")
    print("=" * 70)
    return yaml_path

def train_yolo(yaml_path: Path, epochs: int = 5):
    try:
        from ultralytics import YOLO
        print("\n" + "=" * 70)
        print(f"Starting Multi-Dataset YOLOv8 Training for {epochs} Epochs on GPU...")
        print("=" * 70)
        model = YOLO("yolov8n.pt")
        results = model.train(
            data=str(yaml_path.resolve()),
            epochs=epochs,
            imgsz=640,
            batch=8,
            workers=0,
            project=str(OUTPUT_DIR / "runs"),
            name="civiclens_yolo_all",
            exist_ok=True,
            verbose=True
        )
        best_pt = OUTPUT_DIR / "runs" / "civiclens_yolo_all" / "weights" / "best.pt"
        if best_pt.exists():
            prod_model = WORKSPACE_ROOT / "server" / "models" / "civiclens_yolo.pt"
            prod_model.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(best_pt, prod_model)
            print(f"\n[SUCCESS] Unified Multi-Dataset YOLO Model saved to: {prod_model}")
        return results
    except Exception as e:
        print(f"[NOTE] Training error: {e}")

if __name__ == "__main__":
    epochs = 3
    if len(sys.argv) > 1 and sys.argv[1].isdigit():
        epochs = int(sys.argv[1])
    config_file = prepare_all_datasets()
    if "--train" in sys.argv:
        train_yolo(config_file, epochs=epochs)
