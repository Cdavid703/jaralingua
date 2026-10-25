"""No production data: grade identity regression on in-memory fictional rosters.
GRADE_PRIVACY_API_SOURCE may select the deployed module for post-release checks.
"""
import copy
import importlib.util
import os
from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.dont_write_bytecode = True
os.environ['JARALINGUA_LOCAL_AUTH_SECRET'] = 'grade-privacy-regression-only-not-a-production-secret'
os.environ['JARALINGUA_ADMIN_EMAILS'] = 'global-admin@qa.invalid'
source = Path(os.environ.get('GRADE_PRIVACY_API_SOURCE', ROOT/'server/progress_api.py'))
# Importing or testing the candidate must never touch the operational store.
def protect(event, args):
    if event == 'open' and isinstance(args[0], (str, bytes, os.PathLike)):
        name = str(Path(os.fsdecode(args[0])).resolve())
        if name.startswith('/var/lib/jaralingua/'):
            raise PermissionError('Private academic store is forbidden in this test')
sys.addaudithook(protect)
spec=importlib.util.spec_from_file_location('privacy_candidate',source)
api=importlib.util.module_from_spec(spec)
spec.loader.exec_module(api)

class GradeIdentityPrivacyTests(unittest.TestCase):
    def setUp(self):
        self.book={'adminEmails':['admin@qa.invalid'],'teacherEmails':['teacher@qa.invalid'],
            'allowStudentIdClaim':True, 'evaluations':[{'id':'final','weight':20}],
            'students':[
                {'id':'101','fullName':'QA Alex','email':'alex@qa.invalid','emailAliases':['approved@qa.invalid'],
                 'nameAliases':['QA Alex'],'localUsername':'alex-fixture','localPassword':'private-fixture',
                 'grades':{'final':4.2},'gradeDetails':{'localPassword':'private-fixture','final':{'feedback':'Own feedback'}}},
                {'id':'102','fullName':'QA Blake','email':'blake@qa.invalid','grades':{'final':3.5},'gradeDetails':{}},
                {'id':'103','fullName':'Unlinked fixture','email':'','grades':{},'gradeDetails':{}}]}
        self.before=copy.deepcopy(self.book)
    def tearDown(self):
        self.assertEqual(self.book,self.before,'Identity checks must not alter records, grades or account links')
    def test_registered_account_sees_only_own_record_even_with_other_id(self):
        for email in ['alex@qa.invalid',' ALEX@QA.INVALID ','approved@qa.invalid','alex-fixture']:
            with self.subTest(email=email):
                profile={'email':email,'name':'Different display name','_studentIdClaim':'102'}
                view=api.grade_payload_for(profile,self.book,{'studentId':['102']})
                self.assertEqual(view['student']['id'],'101')
                self.assertEqual(view['students'],[])
                self.assertEqual(view['student']['grades'],{'final':4.2})
                self.assertEqual(api.matched_student_for_profile(profile,self.book)['id'],'101')
    def test_outsider_cannot_claim_by_query_header_or_payload_identity(self):
        for claim in ['101','103','ID-101']:
            profile={'email':'outsider@qa.invalid','name':'QA Alex','_studentIdClaim':claim}
            self.assertIsNone(api.grade_payload_for(profile,self.book,{'studentId':[claim]})['student'])
            self.assertIsNone(api.matched_student_for_profile(profile,self.book))
            self.assertIsNone(api.registered_student_for_profile(profile,self.book))
    def test_gmail_display_name_and_name_alias_cannot_authorize(self):
        for name in ['QA Alex','Dr. QA Alex Additional Name','qa alex']:
            profile={'email':'unrelated-fixture@gmail.com','name':name}
            self.assertIsNone(api.grade_payload_for(profile,self.book,{})['student'])
            self.assertIsNone(api.matched_student_for_profile(profile,self.book))
    def test_missing_identity_does_not_match_unlinked_or_missing_fields(self):
        for profile in [{},{'email':''},{'email':'   ','_studentIdClaim':'103'}]:
            self.assertIsNone(api.grade_payload_for(profile,self.book,{})['student'])
            self.assertIsNone(api.matched_student_for_profile(profile,self.book))
            self.assertFalse(api.email_matches_student(self.book['students'][2],profile.get('email')))
    def test_authorized_teachers_and_admins_keep_roster_access(self):
        for email,role in [('teacher@qa.invalid','teacher'),('admin@qa.invalid','admin'),('global-admin@qa.invalid','admin')]:
            view=api.grade_payload_for({'email':email},self.book,{'studentId':['102']})
            self.assertEqual(view['role'],role)
            self.assertEqual([r['id'] for r in view['students']],['101','102','103'])
            self.assertIsNone(view['student'])
            self.assertNotIn('localPassword',view['students'][0]['gradeDetails'])
    def test_roles_cannot_be_granted_by_name_or_client_claim(self):
        view=api.grade_payload_for({'email':'outsider@qa.invalid','name':'teacher@qa.invalid','role':'admin','_studentIdClaim':'101'},self.book,{})
        self.assertEqual(view['role'],'student')
        self.assertEqual(view['students'],[])
        self.assertIsNone(view['student'])
    def test_legacy_claim_flag_is_never_exposed_as_enabled(self):
        self.assertFalse(api.grade_payload_for({'email':'alex@qa.invalid'},self.book,{})['allowStudentIdClaim'])
    def test_local_login_and_approved_alias_keep_working(self):
        for email in ['alex@qa.invalid','approved@qa.invalid','alex-fixture']:
            result=api.local_gradebook_login({'email':email,'password':'private-fixture'},self.book,'basic2','QA Course')
            profile=api.validate_local_token(result['token'])
            self.assertEqual(api.matched_student_for_profile(profile,self.book)['id'],'101')
    def test_local_login_wrong_password_rejected(self):
        with self.assertRaisesRegex(ValueError,'invalid_credentials'):
            api.local_gradebook_login({'email':'alex@qa.invalid','password':'wrong'},self.book,'basic2','QA Course')

if __name__=='__main__':unittest.main()
