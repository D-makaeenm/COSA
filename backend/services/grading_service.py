from models import db, GradingCriteria

class GradingCriteriaService:
    def get_all_criteria(self, exam_id):
        """
        Lấy danh sách tiêu chí của một exam_id
        """
        criteria = GradingCriteria.query.filter_by(exam_id=exam_id).all()
        return [{
            'id': c.id,
            'exam_id': c.exam_id,
            'criteria_name': c.criteria_name,
            'max_score': c.max_score,
            'description': c.description
        } for c in criteria]

    def add_criteria(self, exam_id, data):
        """
        Thêm mới một tiêu chí vào exam
        """
        new_criteria = GradingCriteria(
            exam_id=exam_id,
            criteria_name=data['criteria_name'],
            max_score=data['max_score'],
            description=data['description']
        )
        db.session.add(new_criteria)
        db.session.commit()

    def update_criteria(self, criteria_id, data):
        """
        Cập nhật một tiêu chí
        """
        criteria = GradingCriteria.query.get(criteria_id)
        if not criteria:
            raise Exception("Criteria not found")
        criteria.criteria_name = data['criteria_name']
        criteria.max_score = data['max_score']
        criteria.description = data['description']
        db.session.commit()

    def delete_criteria(self, criteria_id):
        """
        Xóa một tiêu chí
        """
        criteria = GradingCriteria.query.get(criteria_id)
        if not criteria:
            raise Exception("Criteria not found")
        db.session.delete(criteria)
        db.session.commit()
