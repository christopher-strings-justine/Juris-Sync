from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
import datetime

Base = declarative_base()

class Case(Base):
    __tablename__ = "cases"
    
    id = Column(String, primary_key=True, index=True)
    party_name = Column(String)
    case_type = Column(String)
    jurisdiction = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    contradictions = relationship("ContradictionRecord", back_populates="case")
    sensitive_data = relationship("SensitiveDataRecord", back_populates="case")

class ContradictionRecord(Base):
    __tablename__ = "contradictions"

    id = Column(String, primary_key=True, index=True)
    case_id = Column(String, ForeignKey("cases.id"))
    category = Column(String)
    severity = Column(String)
    confidence_score = Column(Float)
    status = Column(String, default="PENDING") # PENDING, VERIFIED, DISMISSED, REQUEST_EVIDENCE
    
    # Encrypted fields
    encrypted_description = Column(String)
    encrypted_rationale = Column(String)
    encrypted_doc_a_text = Column(String)
    encrypted_doc_b_text = Column(String)

    # Metadata
    doc_a_filename = Column(String)
    doc_b_filename = Column(String)
    
    case = relationship("Case", back_populates="contradictions")

class SensitiveDataRecord(Base):
    __tablename__ = "sensitive_data"

    id = Column(String, primary_key=True, index=True)
    case_id = Column(String, ForeignKey("cases.id"))
    data_type = Column(String)
    
    # Encrypted fields
    encrypted_text = Column(String)

    # Metadata
    file_name = Column(String)
    page = Column(Integer)
    bounding_box = Column(String) # JSON string

    case = relationship("Case", back_populates="sensitive_data")
