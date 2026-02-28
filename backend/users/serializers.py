from rest_framework import serializers


DEFAULT_CATEGORIES = [
    ("Random Thoughts", "#F3C6A3"),
    ("School", "#B7CCC3"),
    ("Personal", "#FBE6BB"),
]


class SignupSerializer(serializers.Serializer):
    """Serializer for user signup."""

    email = serializers.EmailField(required=True, write_only=True)
    password = serializers.CharField(required=True, write_only=True, min_length=8)


class LoginSerializer(serializers.Serializer):
    """Serializer for user login."""

    email = serializers.EmailField(required=True, write_only=True)
    password = serializers.CharField(required=True, write_only=True)
