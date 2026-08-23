from models import Case, ContradictionRecord, SensitiveDataRecord
from database import SessionLocal
from encryption import encrypt_data, decrypt_data
import uuid
import json

def process_and_redact(contradictions_list: list, sensitive_data_list: list, role: str, processed_files: list = None) -> dict:
    """
    Takes the AI contradictions and sensitive data, saves to DB (encrypted),
    and returns redacted version for PUBLIC users.
    """
    db = SessionLocal()
    try:
        # Create a new Case record
        case_id = str(uuid.uuid4())
        new_case = Case(
            id=case_id,
            party_name="Unknown", # Placeholder for Phase 2 Case Management
            case_type="Automated Analysis",
            jurisdiction="US"
        )
        db.add(new_case)
        db.commit()

        processed_contradictions = []
        for c in contradictions_list:
            # Encrypt sensitive fields
            c_id = str(uuid.uuid4())
            record = ContradictionRecord(
                id=c_id,
                case_id=case_id,
                category=c.get("category"),
                severity=c.get("severity"),
                confidence_score=c.get("confidence_score"),
                status="PENDING",
                encrypted_description=encrypt_data(c.get("description")),
                encrypted_rationale=encrypt_data(c.get("legal_rationale")),
                encrypted_doc_a_text=encrypt_data(c["doc_a"].get("extracted_text")),
                encrypted_doc_b_text=encrypt_data(c["doc_b"].get("extracted_text")),
                doc_a_filename=c["doc_a"].get("file_name"),
                doc_b_filename=c["doc_b"].get("file_name")
            )
            db.add(record)
            
            # Decide if we need to redact based on role
            if role in ['judge', 'lawyer', 'org_admin', 'AUTHORIZED']:
                # Full access, no redaction
                c["id"] = c_id
                c["status"] = "PENDING"
                processed_contradictions.append(c)
            else:
                # 'PUBLIC' role -> Redact
                redacted_c = c.copy()
                redacted_c["id"] = c_id
                redacted_c["status"] = "PENDING"
                # Keep bounding boxes but redact text
                if "doc_a" in redacted_c:
                    redacted_c["doc_a"] = c["doc_a"].copy()
                    redacted_c["doc_a"]["extracted_text"] = "[REDACTED - INSUFFICIENT CLEARANCE]"
                if "doc_b" in redacted_c:
                    redacted_c["doc_b"] = c["doc_b"].copy()
                    redacted_c["doc_b"]["extracted_text"] = "[REDACTED - INSUFFICIENT CLEARANCE]"
                
                redacted_c["description"] = "Details withheld. " + c.get("description", "")[:20] + "... [REDACTED]"
                processed_contradictions.append(redacted_c)
                
        processed_sensitive_data = []
        for sd in sensitive_data_list:
            sd_id = str(uuid.uuid4())
            record = SensitiveDataRecord(
                id=sd_id,
                case_id=case_id,
                data_type=sd.get("data_type"),
                encrypted_text=encrypt_data(sd.get("extracted_text")),
                file_name=sd.get("file_name"),
                page=sd.get("page"),
                bounding_box=json.dumps(sd.get("bounding_box", []))
            )
            db.add(record)
            
            if role in ['judge', 'lawyer', 'org_admin', 'AUTHORIZED']:
                sd["id"] = sd_id
                processed_sensitive_data.append(sd)
            else:
                redacted_sd = sd.copy()
                redacted_sd["id"] = sd_id
                redacted_sd["extracted_text"] = "[REDACTED]"
                processed_sensitive_data.append(redacted_sd)

        db.commit()
        return {
            "contradictions": processed_contradictions,
            "sensitive_data": processed_sensitive_data,
            "processed_files": processed_files or []
        }
        
    finally:
        db.close()
