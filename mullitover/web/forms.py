from django import forms

class StatusForm(forms.Form):
    userid = forms.CharField(max_length=64)
    text = forms.CharField(widget=forms.Textarea)
    posted = forms.BooleanField(required=False);
    bundle = forms.IntegerField(required=False);

class FBAuthForm(forms.Form):
    userid = forms.CharField(max_length=64)
    authtoken = forms.CharField(max_length=255)
    expiry = forms.IntegerField()
