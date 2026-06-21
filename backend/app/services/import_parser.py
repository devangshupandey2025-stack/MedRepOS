import os
from datetime import UTC, datetime
from pathlib import Path

import pandas as pd
from sqlalchemy.orm import Session

from app.models.import_log import ImportLog
from app.models.sales_record import SalesRecord


class ImportParser:
    REQUIRED_COLUMNS = {"product", "territory", "quantity", "revenue", "date"}
    COLUMN_ALIASES = {
        "product": ["product", "product_name", "item", "drug", "brand", "medicine"],
        "territory": ["territory", "region", "area", "location", "city", "district"],
        "quantity": ["quantity", "qty", "units", "count", "volume"],
        "revenue": ["revenue", "sales", "amount", "value", "total", "net_amount"],
        "date": ["date", "sale_date", "transaction_date", "trans_date", "dt", "time"],
    }

    @staticmethod
    def _normalise_columns(cols: list[str]) -> dict[str, str]:
        mapping = {}
        for col in cols:
            col_lower = col.lower().strip()
            for standard, aliases in ImportParser.COLUMN_ALIASES.items():
                if col_lower in aliases:
                    mapping[col] = standard
                    break
            else:
                mapping[col] = col_lower
        return mapping

    @staticmethod
    def _validate_columns(mapping: dict[str, str]) -> list[str]:
        found = {v for v in mapping.values() if v in ImportParser.REQUIRED_COLUMNS}
        missing = ImportParser.REQUIRED_COLUMNS - found
        return list(missing)

    @staticmethod
    def _parse_date(val) -> datetime | None:
        if pd.isna(val):
            return None
        if isinstance(val, datetime):
            return val
        try:
            return pd.to_datetime(val).to_pydatetime()
        except (ValueError, TypeError):
            return None

    def parse(self, file_path: str | Path) -> list[dict]:
        ext = Path(file_path).suffix.lower()

        if ext == ".csv":
            df = pd.read_csv(file_path)
        elif ext in (".xls", ".xlsx"):
            df = pd.read_excel(file_path, engine="openpyxl" if ext == ".xlsx" else "xlrd")
        else:
            raise ValueError(f"Unsupported file type: {ext}")

        df = df.dropna(how="all")

        mapping = self._normalise_columns(list(df.columns))
        missing = self._validate_columns(mapping)
        if missing:
            raise ValueError(
                f"Missing required columns: {', '.join(missing)}. "
                f"Expected one of: product, territory, quantity, revenue, date. "
                f"Found columns: {list(df.columns)}"
            )

        records = []
        for _, row in df.iterrows():
            parsed: dict = {}
            raw = {}
            for orig_col, std_col in mapping.items():
                raw[std_col] = row.get(orig_col)

            parsed["product_name"] = str(raw.get("product", ""))
            parsed["territory"] = str(raw.get("territory", ""))
            parsed["quantity"] = float(raw.get("quantity", 0))
            parsed["revenue"] = float(raw.get("revenue", 0))

            sale_date = self._parse_date(raw.get("date"))
            if sale_date is None:
                continue

            parsed["sale_date"] = sale_date
            records.append(parsed)

        return records

    def import_file(
        self, file_path: str | Path, db: Session
    ) -> ImportLog:
        filename = Path(file_path).name
        ext = Path(file_path).suffix.lower().lstrip(".")

        import_log = ImportLog(
            filename=filename,
            file_type=ext,
            status="processing",
        )
        db.add(import_log)
        db.flush()

        try:
            records = self.parse(file_path)
        except Exception as e:
            import_log.status = "failed"
            db.flush()
            raise e

        success = 0
        errors = 0
        for rec in records:
            try:
                record = SalesRecord(
                    product_name=rec["product_name"],
                    territory=rec["territory"],
                    quantity=rec["quantity"],
                    revenue=rec["revenue"],
                    sale_date=rec["sale_date"],
                )
                db.add(record)
                success += 1
            except Exception:
                errors += 1

        import_log.status = "completed" if errors == 0 else "partial"
        import_log.total_rows = len(records)
        import_log.successful_rows = success
        import_log.error_rows = errors
        db.flush()

        return import_log
