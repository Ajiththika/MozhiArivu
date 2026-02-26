// f:\Uki\Final Project\Tamil Learning Platform\backend\services\parentLinkService.js
import User from '@/models/userModel';
import ParentStudentLink from '@/models/parentStudentLinkModel';
import StudentProfile from '@/models/studentProfileModel';
import AuditLog from '@/models/auditLogModel';

export const parentLinkService = {
    async requestLink(parentId, studentEmail) {
        const student = await User.findOne({ email: studentEmail, role: 'USER_STUDENT' });
        if (!student) {
            throw new Error('Student not found.');
        }

        const existingLink = await ParentStudentLink.findOne({ parentId, studentId: student._id });
        if (existingLink) {
            throw new Error('Link already requested or approved.');
        }

        const link = await ParentStudentLink.create({
            parentId,
            studentId: student._id,
            status: 'PENDING'
        });

        return link;
    },

    async approveLink(linkId, approverId) {
        const link = await ParentStudentLink.findById(linkId);
        if (!link) {
            throw new Error('Link request not found.');
        }

        link.status = 'APPROVED';
        link.approvedBy = approverId;
        link.approvedAt = new Date();
        await link.save();

        await User.findByIdAndUpdate(link.parentId, { $addToSet: { linkedStudents: link.studentId } });
        await AuditLog.create({ userId: approverId, action: 'PARENT_LINKED', metadata: { linkId: link._id } });

        return link;
    },

    async getStudentProgressForParent(parentId, studentId) {
        const link = await ParentStudentLink.findOne({ parentId, studentId, status: 'APPROVED' });
        if (!link) {
            throw new Error('Unauthorized or unapproved link.');
        }

        const profile = await StudentProfile.findOne({ studentId });
        if (!profile) {
            throw new Error('Student profile not found.');
        }

        if (!profile.parentCanView) {
            throw new Error('Access to progress is restricted.');
        }

        return profile.progress;
    }
};
